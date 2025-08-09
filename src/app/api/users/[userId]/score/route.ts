import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      ratings: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const totalRatings = user.ratings.length;
  const averageRating =
    totalRatings > 0
      ? user.ratings.reduce(
          (sum, rating) => sum + (rating.rating == "POSITIVE" ? 1 : 0),
          0
        ) / totalRatings
      : 0;

  return NextResponse.json({
    ...user,
    averageRating,
    totalRatings,
  });
}
