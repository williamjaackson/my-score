import { useToken } from "@/hooks/useToken";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import WallFeed from "./wall-feed";
import NewWallPostForm from "./wall-new";

export const dynamic = "force-dynamic";

export default async function WallPage() {
  const { userId } = await useToken();
  if (!userId) redirect("/login");

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Global Wall</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Share a quick update. Everyone can see it.
          </p>
          <NewWallPostForm />
        </CardContent>
      </Card>
      <Suspense fallback={<p>Loading wall...</p>}>
        <WallFeed />
      </Suspense>
    </div>
  );
}
