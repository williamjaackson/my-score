import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RedirectType } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import Link from "next/link";

import CircularScore from "@/components/score/Score";
import TotalScore from "./TotalScore";
import ScoreBreakdown from "./ScoreBreakdown";
import { ScoreProvider } from "@/components/score/ScoreContext";
import ViewPublicProfile from "./ViewPublicProfile";

export default async function Home() {
  const { userId, name } = await useToken();

  const tasks = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) redirect("/login", RedirectType.replace);
  if (!user?.email)
    tasks.push({
      icon: <Lock className="h-4 w-4" />,
      text: "Add an authentication method.",
      link: "/verify",
    });

  return (
    <ScoreProvider>
      <div className="p-4 max-w-3xl mx-auto">
        <TotalScore />
        <ScoreBreakdown />
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* two cards. card 1: GOod Morning, Wil */}
          <Card>
            {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
            <CardContent>
              <p>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good Morning,";
                  if (hour < 18) return "Good Afternoon,";
                  return "Good Evening,";
                })()}
              </p>
              <p className="text-2xl font-semibold">{name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You have no tasks for today.
                  </p>
                ) : (
                  tasks.map((task, index) => (
                    <Link
                      href={task.link}
                      key={index}
                      className="p-2 border rounded-md flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      {task.icon}
                      <span>{task.text}</span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mx-auto w-fit my-4 text-white">
          <ViewPublicProfile />
        </div>
      </div>
    </ScoreProvider>
  );
}
