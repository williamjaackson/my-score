import prisma from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function WallFeed() {
  const posts = await prisma.wallPost.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-3">
      {posts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No posts yet. Be the first.
        </p>
      )}
      {posts.map((p) => (
        <Card key={p.id} className="border border-gray-200">
          <CardContent className="p-3 flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {p.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium truncate">{p.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                {p.content}
              </p>
              {typeof p.govSentimentScore === "number" && (
                <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Govt Sentiment: {p.govSentimentScore}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
