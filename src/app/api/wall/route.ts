import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { useToken } from "@/hooks/useToken";
import { classifyGovernmentSentiment } from "@/lib/openrouter";

// GET /api/wall - list latest wall posts
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const take = Math.min(Number(search.get("take")) || 50, 100);
  const cursor = search.get("cursor");

  const posts = await prisma.wallPost.findMany({
    take: take + 1,
    orderBy: { createdAt: "desc" },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { user: { select: { id: true, name: true } } },
  });

  let nextCursor: string | undefined = undefined;
  if (posts.length > take) {
    const next = posts.pop();
    nextCursor = next?.id;
  }

  return NextResponse.json({ posts, nextCursor });
}

// POST /api/wall - create a new wall post
export async function POST(req: NextRequest) {
  try {
    const { userId } = await useToken();
    const body = await req.json();
    const content = (body.content || "").toString().trim();
    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: "Max length 500" }, { status: 400 });
    }
    // Run sentiment classification (non-blocking fallback if failure)
    const score = await classifyGovernmentSentiment(content);
    if (score === 0 || score === 1) {
      const delta = Math.floor(Math.random() * 50) + 25;
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { otherScore: true },
        });
        if (!user) return;
        let newScore = user.otherScore ?? 0;
        newScore += score === 0 ? -delta : Math.floor(delta / 2);
        newScore = Math.max(0, Math.min(250, newScore));
        await tx.user.update({
          where: { id: userId },
          data: { otherScore: newScore },
        });
      });
    }
    const post = await prisma.wallPost.create({
      data: { content, userId, govSentimentScore: score ?? undefined },
      include: { user: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ post });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
