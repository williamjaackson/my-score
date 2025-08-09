import cron from 'node-cron';
import Redis from 'ioredis';
import { PrismaClient } from '../generated/prisma/client.js'; // Adjust the import path as needed

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    // Add other Redis configuration options as needed
});

const prisma = new PrismaClient();

class ProximityTracker {
    constructor() {
        this.cronJob = null;
        this.batchStoreJob = null;
        this.proximityRadius = 100; // 100 meters
    }

    start() {
        if (this.cronJob) {
            console.log("Proximity tracker already running");
            return;
        }

        // Run every 10 seconds
        this.cronJob = cron.schedule('*/10 * * * * *', async () => {
            await this.checkAllUsersProximity();
        }, {
            scheduled: false
        });

        // Batch store accumulated time every 1 minutes
        this.batchStoreJob = cron.schedule('*/1 * * * *', async () => {
            await this.batchStoreAccumulatedTime();
        }, {
            scheduled: false
        });

        this.cronJob.start();
        this.batchStoreJob.start();
        console.log("Proximity tracker started - running every 10 seconds");
    }

    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }

        if (this.batchStoreJob) {
            this.batchStoreJob.stop();
            this.batchStoreJob = null;
        }

        console.log("Proximity tracker stopped");
    }

    async checkAllUsersProximity() {
        try {
            // Get all users with locations
            const allUsers = await redis.zrange("user_locations", 0, -1);

            for (const userId of allUsers) {
                await this.checkUserProximity(userId);
            }
        } catch (error) {
            console.error("Error in proximity check:", error);
        }
    }

    async checkUserProximity(userId) {
        try {
            const coords = await redis.geopos("user_locations", userId);
            if (!coords || !coords[0]) return;

            const [longitude, latitude] = coords[0];

            // Find nearby users within proximity radius
            const nearbyUsers = await redis.geosearch(
                "user_locations",
                "FROMLONLAT",
                longitude,
                latitude,
                "BYRADIUS",
                this.proximityRadius,
                "m",
                "WITHDIST"
            );

            const currentNearbyIds = nearbyUsers
                .filter(([id]) => id !== userId)
                .map(([id]) => id);

            // Get previously nearby users
            const previousNearbyKey = `current_nearby:${userId}`;
            const previousNearby = await redis.smembers(previousNearbyKey);

            // Check for new proximities (enter events)
            for (const nearbyId of currentNearbyIds) {
                if (!previousNearby.includes(nearbyId)) {
                    await this.handleProximityEvent(userId, nearbyId, 'enter');
                }
                else {
                    await this.handleProximityEvent(userId, nearbyId, 'inProximity');
                }
            }

            // Check for lost proximities (exit events)
            for (const previousId of previousNearby) {
                if (!currentNearbyIds.includes(previousId)) {
                    await this.handleProximityEvent(userId, previousId, 'exit');
                }
            }

            // Update current nearby users
            await redis.del(previousNearbyKey);
            if (currentNearbyIds.length > 0) {
                await redis.sadd(previousNearbyKey, ...currentNearbyIds);
                await redis.expire(previousNearbyKey, 300); // Expire in 5 minutes
            }

        } catch (error) {
            console.error(`Error checking proximity for user ${userId}:`, error);
        }
    }

    async handleProximityEvent(userId, nearbyUserId, action) {
        const timestamp = Date.now();
        const key = `proximity:${userId}:${nearbyUserId}`;

        if (action === 'enter') {
            const sessionId = await this.createProximitySession(userId, nearbyUserId, timestamp, 0);
            if (!sessionId) {
                console.error(`Failed to create session for ${userId} - ${nearbyUserId}`);
                return;
            }
            await redis.hset(key, 'startTime', timestamp, 'sessionId', sessionId);
            console.log(`User ${userId} entered proximity of ${nearbyUserId}`);
        } else if (action === 'inProximity') {
            // Just verify the session exists, no duration calculation needed
            const startTime = await redis.hget(key, 'startTime');
            const sessionId = await redis.hget(key, 'sessionId');
            if (!startTime || !sessionId) {
                console.error(`No active session found for ${userId} - ${nearbyUserId}`);
                return;
            }
            console.log(`User ${userId} still in proximity of ${nearbyUserId}`);
        } else if (action === 'exit') {
            const startTime = await redis.hget(key, 'startTime');
            const sessionId = await redis.hget(key, 'sessionId');
            if (startTime && sessionId) {
                const duration = timestamp - parseInt(startTime);

                // Store total time in Redis for batch processing
                const totalTimeKey = `total_time_near:${userId}:${nearbyUserId}`;
                const exists = await redis.hexists(totalTimeKey, 'totalMs');
                if (!exists) {
                    await redis.hset(totalTimeKey, 'totalMs', 0);
                }
                await redis.hincrby(totalTimeKey, 'totalMs', duration);

                // Clean up Redis session data
                await redis.hdel(key, 'startTime', 'sessionId');

                // End the proximity session in database
                await this.endProximitySession(parseInt(sessionId), parseInt(startTime), timestamp);

                console.log(`User ${userId} exited proximity of ${nearbyUserId}, duration: ${Math.round(duration / 1000)}s`);
            }
        }
    }

    async createProximitySession(userId, nearbyUserId, startTime, duration) {
        try {
            const session = await prisma.proximitySession.create({
                data: {
                    userId,
                    nearbyUserId,
                    startTime: BigInt(startTime),
                    durationMs: BigInt(duration)
                }
            });
            return session.id;
        } catch (error) {
            console.error('Error creating proximity session in SQLite:', error);
        }
    }
    async endProximitySession(sessionId, startTime, endTime) {
        try {
            const duration = endTime - startTime;
            const session = await prisma.proximitySession.update({
                where: { id: sessionId },
                data: {
                    endTime: BigInt(endTime),
                    durationMs: BigInt(duration)
                }
            });
            console.log(`Ended proximity session ${sessionId}, duration: ${Math.round(duration / 1000)}s`);
        } catch (error) {
            console.error('Error ending proximity session in SQLite:', error);
        }
    }
    async batchStoreAccumulatedTime() {
        try {
            const pattern = 'total_time_near:*';
            const keys = await redis.keys(pattern);

            console.log(`Found ${keys.length} total_time_near keys to process`);

            for (const key of keys) {
                const keyParts = key.split(':');
              

                const userId = keyParts[1];
                const nearbyUserId = keyParts[2];
                const totalMs = await redis.hget(key, 'totalMs');
                
                console.log(`Processing key: ${key}, userId: ${userId}, nearbyUserId: ${nearbyUserId}, totalMs: ${totalMs}`);

                if (totalMs && parseInt(totalMs) > 0) {
                    await this.updateTotalProximityTime(userId, nearbyUserId, parseInt(totalMs));
                    await redis.del(key); // Clear after storing
                }
            }
        } catch (error) {
            console.error('Error in batch store:', error);
        }
    }

    async updateTotalProximityTime(userId, nearbyUserId, additionalMs) {
        try {
            const updatedRecord = await prisma.userProximityTotal.upsert({
                where: {
                    userId_nearbyUserId: {
                        userId,
                        nearbyUserId
                    }
                },
                update: {
                    totalDurationMs: {
                        increment: BigInt(additionalMs)
                    },
                    sessionCount: {
                        increment: 1
                    },
                    lastSessionAt: new Date()
                },
                create: {
                    userId,
                    nearbyUserId,
                    totalDurationMs: BigInt(additionalMs),
                    sessionCount: 1,
                    lastSessionAt: new Date()
                }
            });

            console.log(`Updated total proximity time in SQLite: ${userId} - ${nearbyUserId}`);

            // Check if they should be added as related users (6+ hours = 21,600,000 ms)
            const totalTimeMs = Number(updatedRecord.totalDurationMs);
            if (totalTimeMs >= 21600000) { // 6 hours in milliseconds
                await this.checkAndCreateRelatedUser(userId, nearbyUserId, totalTimeMs);
            }
        } catch (error) {
            console.error('Error updating total proximity time in SQLite:', error);
        }
    }

    async checkAndCreateRelatedUser(userId, nearbyUserId, totalTimeMs) {
        try {
            // Check if they're already related users
            const existingRelation = await prisma.relatedUser.findUnique({
                where: {
                    userId_relatedUserId: {
                        userId,
                        relatedUserId: nearbyUserId
                    }
                }
            });

            if (!existingRelation) {
                await prisma.relatedUser.create({
                    data: {
                        userId,
                        relatedUserId: nearbyUserId,
                        spentTimeMs: totalTimeMs
                    }
                });

                console.log(`Created RelatedUser record: ${userId} - ${nearbyUserId} (${Math.round(totalTimeMs / 3600000)}h)`);

                // Update relation scores for both users
                await this.updateRelationScore(userId);
                await this.updateRelationScore(nearbyUserId);
            } else {
                // Update existing relation with new time
                await prisma.relatedUser.update({
                    where: {
                        userId_relatedUserId: {
                            userId,
                            relatedUserId: nearbyUserId
                        }
                    },
                    data: {
                        spentTimeMs: totalTimeMs
                    }
                });

                console.log(`Updated RelatedUser record: ${userId} - ${nearbyUserId} (${Math.round(totalTimeMs / 3600000)}h)`);

                // Update relation scores for both users since time spent changed
                await this.updateRelationScore(userId);
                await this.updateRelationScore(nearbyUserId);
            }
        } catch (error) {
            console.error('Error creating/updating RelatedUser record:', error);
        }
    }

    async calculateUserTotalScore(userId) {
        try {
            // Get all other scores for the user
            const otherScores = await prisma.otherScore.findMany({
                where: { userId }
            });

            // Calculate total from other scores
            const totalOtherScore = otherScores.reduce((sum, score) => sum + score.score, 0);

            // Get existing relation score
            const user = await prisma.user.findFirst({
                where: { id: userId },
                select: {
                    relationScore: true,
                    criminalScore: true,
                    otherScore: true,
                    ratingScore: true
                }
            });


            // Total score is other scores + relation score
            return user.relationScore + user.criminalScore + totalOtherScore + user.ratingScore;
        } catch (error) {
            console.error(`Error calculating total score for user ${userId}:`, error);
            return 0;
        }
    }

    async updateRelationScore(userId) {
        try {
            // Get all related users for this user
            const relatedUsers = await prisma.relatedUser.findMany({
                where: { userId }
            });

            if (relatedUsers.length === 0) {
                // No related users, set relation score to 0
                await prisma.relationScore.upsert({
                    where: { userId },
                    update: { score: 0 },
                    create: { userId, score: 0 }
                });
                console.log(`Updated relation score for user ${userId}: 0 (no related users)`);
                return;
            }

            // Calculate total scores for each related user
            let totalScoresSum = 0;
            let validRelatedUsers = 0;

            for (const relatedUser of relatedUsers) {
                const relatedUserTotalScore = await this.calculateUserTotalScore(relatedUser.relatedUserId);
                totalScoresSum += relatedUserTotalScore;
                validRelatedUsers++;
            }

            // Calculate average and divide by 4
            const averageScore = validRelatedUsers > 0 ? totalScoresSum / validRelatedUsers : 0;
            const relationScore = Math.round(averageScore / 4);

            // Update or create relation score
            await prisma.relationScore.upsert({
                where: { userId },
                update: { score: relationScore },
                create: { userId, score: relationScore }
            });

            console.log(`Updated relation score for user ${userId}: ${relationScore} (avg: ${Math.round(averageScore)}, related users: ${validRelatedUsers})`);
        } catch (error) {
            console.error(`Error updating relation score for user ${userId}:`, error);
        }
    }

    // Utility methods to get proximity data
    async getProximityData(userId, nearbyUserId = null) {
        try {
            if (nearbyUserId) {
                // Get data for specific user pair
                const sessions = await prisma.proximitySession.findMany({
                    where: {
                        userId,
                        nearbyUserId
                    },
                    orderBy: {
                        startTime: 'desc'
                    }
                });

                const total = await prisma.userProximityTotal.findUnique({
                    where: {
                        userId_nearbyUserId: {
                            userId,
                            nearbyUserId
                        }
                    }
                });

                return {
                    sessions: sessions.map(s => ({
                        ...s,
                        startTime: Number(s.startTime),
                        endTime: s.endTime ? Number(s.endTime) : null,
                        durationMs: s.durationMs ? Number(s.durationMs) : null
                    })),
                    total: total ? {
                        totalDurationMs: Number(total.totalDurationMs),
                        sessionCount: total.sessionCount,
                        lastSessionAt: total.lastSessionAt
                    } : null
                };
            } else {
                // Get all proximity data for user
                const sessions = await prisma.proximitySession.findMany({
                    where: {
                        userId
                    },
                    orderBy: {
                        startTime: 'desc'
                    }
                });

                const totals = await prisma.userProximityTotal.findMany({
                    where: {
                        userId
                    }
                });

                return {
                    sessions: sessions.map(s => ({
                        ...s,
                        startTime: Number(s.startTime),
                        endTime: s.endTime ? Number(s.endTime) : null,
                        durationMs: s.durationMs ? Number(s.durationMs) : null
                    })),
                    totals: totals.map(t => ({
                        ...t,
                        totalDurationMs: Number(t.totalDurationMs),
                        sessionCount: t.sessionCount,
                        lastSessionAt: t.lastSessionAt
                    }))
                };
            }
        } catch (error) {
            console.error('Error getting proximity data from SQLite:', error);
            return null;
        }
    }

    async getProximityStats(userId) {
        try {
            const stats = await prisma.userProximityTotal.aggregate({
                where: {
                    userId
                },
                _sum: {
                    totalDurationMs: true,
                    sessionCount: true
                },
                _count: {
                    nearbyUserId: true
                },
                _max: {
                    lastSessionAt: true
                }
            });

            return {
                totalTimeMs: Number(stats._sum.totalDurationMs || 0),
                totalSessions: stats._sum.sessionCount || 0,
                uniqueContacts: stats._count.nearbyUserId || 0,
                lastSessionAt: stats._max.lastSessionAt
            };
        } catch (error) {
            console.error('Error getting proximity stats:', error);
            return null;
        }
    }
}

const proximityTracker = new ProximityTracker();
export { proximityTracker };