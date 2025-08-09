import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

function storeLocationData(
  longitude: number,
  latitude: number,
  userId: string
) {
  // Store the location data in Redis or any other storage
  return redis.geoadd("user_locations", longitude, latitude, userId);
}
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = await request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  console.log("Updating location for user:", userId);
  const body = await request.json();
  const { longitude, latitude } = body;

  if (!longitude || !latitude) {
    return NextResponse.json(
      { error: "Longitude and latitude are required" },
      { status: 400 }
    );
  }

  await storeLocationData(longitude, latitude, userId);
  return NextResponse.json({ message: "Location updated successfully" });
}
