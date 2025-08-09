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

        // Batch store accumulated time every 5 minutes
        this.batchStoreJob = cron.schedule('*/5 * * * *', async () => {
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
            await redis.hset(key, 'startTime', timestamp);
            console.log(`User ${userId} entered proximity of ${nearbyUserId}`);
        } else if (action === 'exit') {
            const startTime = await redis.hget(key, 'startTime');
            if (startTime) {
                const duration = timestamp - parseInt(startTime);

                // Store in Redis (existing)
                await redis.hincrby(`total_time_near:${userId}:${nearbyUserId}`, 'totalMs', duration);
                await redis.hdel(key, 'startTime');

                // Store individual session in SQLite using Prisma
                await this.storeProximitySession(userId, nearbyUserId, parseInt(startTime), timestamp, duration);

                console.log(`User ${userId} exited proximity of ${nearbyUserId}, duration: ${Math.round(duration / 1000)}s`);
            }
        }
    }

    async storeProximitySession(userId, nearbyUserId, startTime, endTime, duration) {
        try {
            await prisma.proximitySession.create({
                data: {
                    userId,
                    nearbyUserId,
                    startTime: BigInt(startTime),
                    endTime: BigInt(endTime),
                    durationMs: BigInt(duration)
                }
            });

            console.log(`Stored proximity session in SQLite: ${userId} - ${nearbyUserId}`);
        } catch (error) {
            console.error('Error storing proximity session to SQLite:', error);
        }
    }

    async batchStoreAccumulatedTime() {
        try {
            const pattern = 'total_time_near:*';
            const keys = await redis.keys(pattern);

            for (const key of keys) {
                const [, , userId, nearbyUserId] = key.split(':');
                const totalMs = await redis.hget(key, 'totalMs');

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
            const relationScore = await prisma.relationScore.findFirst({
                where: { userId }
            });

            const currentRelationScore = relationScore ? relationScore.score : 0;

            // Total score is other scores + relation score
            return totalOtherScore + currentRelationScore;
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