import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import jwt from "jsonwebtoken";
function storeLocationData(
  longitude: number,
  latitude: number,
  userId: string
) {
  // Store the location data in Redis or any other storage
  return redis.geoadd("user_locations", longitude, latitude, userId);
}
export async function PUT(request: NextRequest) {
   const token = request.cookies.get("session-token")?.value;
    if (!token)
      return NextResponse.json({ error: "Session token is required" }, { status: 400 });
  
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "JWT secret is not configured" }, { status: 500 });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET) as { id?: string; email?: string; name?: string };
  
    if (!user || !user.id)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
  
  const userId = user?.id;

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
