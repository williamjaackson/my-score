import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const coords = await redis.geopos("user_locations", userId);

    if (!coords || !coords[0]) {
      throw new Error("User location not found");
    }

    const [longitude, latitude] = coords[0];

    // Search nearby users within 10 km radius
    const nearbyUsers = (await redis.geosearch(
      "user_locations",
      "FROMLONLAT",
      longitude,
      latitude,
      "BYRADIUS",
      1, 
      "m",
      "WITHDIST",
      "WITHCOORD",
      "ASC"
    )) as [string, number, [number, number]][];

    return NextResponse.json({
      nearbyUsers: await Promise.all(
        nearbyUsers
          .filter((user) => user[0] !== userId) // Filter before mapping to exclude current user
          .map(async (user) => {
            // Get total time spent near this user
            const totalTimeMs = await redis.hget(
              `total_time_near:${userId}:${user[0]}`,
              "totalMs"
            );
            const totalTimeMinutes = totalTimeMs
              ? Math.round(parseInt(totalTimeMs) / (1000 * 60))
              : 0;

            // Check if currently in proximity (within 100m)
            const currentlyNear = await redis.sismember(
              `current_nearby:${userId}`,
              user[0]
            );

            return {
              id: user[0],
              distance: user[1],
              coordinates: {
                longitude: user[2][0],
                latitude: user[2][1],
              },
              totalTimeSpentNear: totalTimeMinutes, // in minutes
              currentlyInProximity: !!currentlyNear,
              profile: await prisma.user.findUnique({
                where: { id: user[0] },
                select: {
                  name: true,

                  ratingScore: true,
                  relationScore: true,
                  criminalScore: true,
                  otherScore: true,
                },
              }),
            };
          })
      ),
    });
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return NextResponse.json(
      { error: "Failed to find nearby users" },
      { status: 500 }
    );
  }
}
