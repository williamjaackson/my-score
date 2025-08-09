import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(request, { params }) {

  const { userId } = await params;

  const users = await prisma.user.findMany({
    where: {
      id: userId
    },
    include: {
      ratings: true,
      sentRating: true,
    },
  });



  return NextResponse.json(users);
}
export async function POST(request, { params }) {
   const authorId = request.headers.get('x-user-id');
  const { userId } = await params;
  const body = await request.json();
  const { rating, comment } = body;


  if (!userId || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const existingRating = await prisma.rating.findFirst({
    where: {
      targetId: userId,
      authorId: authorId,
      lastRatedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Check if rated in the last 24 hours
      },
    },
  });

  if (existingRating) {
    return NextResponse.json({ error: 'You have already rated this user in the last 24 hours' }, { status: 400 });
  }

  const rate = await prisma.rating.create({
    data: {
      targetId: userId,
      authorId,
      rating: rating == 1 ? 'POSITIVE' : 'NEGATIVE',
      comment,
     
    },
  });

  return NextResponse.json(rate);
}
//(score * totalreviews + newrating) / (totalreviews + 1)