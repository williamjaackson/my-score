import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const users = await prisma.user.findMany({
    where: {
      id: userId,
    },
    select: {
      ratingsReceived: true,
      ratingsGiven: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authorId = request.headers.get("x-user-id");
  const { userId } = await params;
  const body = await request.json();
  const { rating, comment } = body;

  // rating should be +1 or -1
  if (!userId || (rating !== 1 && rating !== -1) || !authorId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Prevent self-rating
  if (authorId === userId) {
    return NextResponse.json(
      { error: "You cannot rate yourself" },
      { status: 403 }
    );
  }

  // Check if already rated in last 24 hours
  const existingRating = await prisma.rating.findFirst({
    where: {
      targetId: userId,
      authorId: authorId,
      updatedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  if (existingRating) {
    return NextResponse.json(
      { error: "You have already rated this user in the last 24 hours" },
      { status: 400 }
    );
  }

  // Create the rating
  const rate = await prisma.rating.create({
    data: {
      targetId: userId,
      authorId,
      rating: rating === 1 ? "POSITIVE" : "NEGATIVE",
      comment,
    },
  });

  // Recalculate average rating from scratch
  const allRatings = await prisma.rating.findMany({
    where: { targetId: userId },
    select: { rating: true },
  });

  const totalReviews = allRatings.length;
  const sumRatings = allRatings.reduce((sum, r) => {
    return sum + (r.rating === "POSITIVE" ? 1 : -1);
  }, 0);

  const averageScore = totalReviews > 0 ? sumRatings / totalReviews : 0;
  const averageRating = 125 * (averageScore + 1);

  // Update user with new average score
  await prisma.user.update({
    where: { id: userId },
    data: {
      ratingScore: averageRating,
    },
  });

  return NextResponse.json(rate);
}
