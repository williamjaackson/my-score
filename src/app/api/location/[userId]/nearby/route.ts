import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;

  try {
    const coords = await redis.geopos("user_locations", userId);

    if (!coords || !coords[0]) {
      throw new Error("User location not found");
    }

    const [longitude, latitude] = coords[0];

    // 2. Search nearby users within 10 km radius of that point
    const nearbyUsers = await redis.geosearch(
      "user_locations",
      "FROMLONLAT",
      longitude,
      latitude,
      "BYRADIUS",
      10,
      "m",
      "WITHDIST",
      "WITHCOORD",
      "ASC"
    );

    return NextResponse.json({
      nearbyUsers: await Promise.all(
        nearbyUsers
          .map(async (user) => ({
            id: user[0],
            distance: user[1],
            coordinates: {
              longitude: user[2][0],
              latitude: user[2][1],
            },
            profile: await prisma.user.findUnique({
              where: { id: user[0] },
              select: { name: true },
            }),
          }))
          .filter((user) => user.id !== userId)
      ), // Exclude the current user
    });
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return NextResponse.json(
      { error: "Failed to find nearby users" },
      { status: 500 }
    );
  }
}
