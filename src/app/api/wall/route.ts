import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { classifyGovernmentSentiment } from "@/lib/openrouter";
import jwt from "jsonwebtoken";
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
export async function POST(request: NextRequest) {
  try {

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
    const body = await request.json();
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
        const _user = await tx.user.findUnique({
          where: { id: user.id },
          select: { otherScore: true },
        });
        if (!_user) return;
        let newScore = _user.otherScore ?? 0;
        newScore += score === 0 ? -delta : Math.floor(delta / 2);
        newScore = Math.max(0, Math.min(250, newScore));
        await tx.user.update({
          where: { id: user.id },
          data: { otherScore: newScore },
        });
      });
    }
    const post = await prisma.wallPost.create({
      data: { content, userId: user.id, govSentimentScore: score ?? undefined },
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
