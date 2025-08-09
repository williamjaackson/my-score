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
    select: {
      ratingsReceived: true,
      criminalScore: true,
      otherScore: true,
      relationScore: true,
      ratingScore: true,
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ratings = user.ratingsReceived;
  let runningAverage = 0;

  for (let i = 0; i < ratings.length; i++) {
    const currentRatingValue = ratings[i].rating === "POSITIVE" ? 1 : 0;
    runningAverage = runningAverage + (currentRatingValue - runningAverage) / (i + 1);
  }

  const rating = ratings.length > 0 ? runningAverage : 0;

  const totalScore = user.relationScore + user.criminalScore + user.otherScore + user.ratingScore;

  return NextResponse.json({
    ...user,
    rating,
    totalScore,
    relationScore: user.relationScore,
    criminalScore: user.criminalScore,
    otherScore: user.otherScore,
    ratingScore: user.ratingScore,
    totalRatings: ratings.length,
  });
}
