import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RedirectType } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import Link from "next/link";
import CircularScore from "@/components/score/Score";

export default async function Home() {
  const { userId, name } = await useToken();

  const tasks = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) redirect("/auth/login", RedirectType.replace);
  if (!user?.email)
    tasks.push({
      icon: <Lock className="h-4 w-4" />,
      text: "Add an authentication method.",
      link: "/verify",
    });

  return (
    <>
      <div className="p-4 max-w-3xl mx-auto">
        <Card className="w-fit mx-auto md:my-10 rounded-full">
          <CardContent className="flex gap-4">
            <CircularScore
              score={879}
              maxScore={1000}
              radius={80}
              strokeWidth={15}
              segments={[{ value: 879, color: "#f5de0e" }]}
              showScore={true}
              scoreFontSize="2.5rem"
            />
          </CardContent>
        </Card>
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Scores Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* Scores Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 justify-center">
              <CircularScore
                score={user.criminalScore - 33}
                maxScore={250}
                radius={50}
                strokeWidth={10}
                segments={[
                  { value: user.criminalScore - 33, color: "#ef4444" },
                ]}
                label="Criminal"
              />
              <CircularScore
                score={user.otherScore - 34}
                maxScore={250}
                radius={50}
                strokeWidth={10}
                segments={[{ value: user.otherScore - 34, color: "#8b5cf6" }]}
                label="Other"
              />
              <CircularScore
                score={user.ratingScore - 33}
                maxScore={250}
                radius={50}
                strokeWidth={10}
                segments={[{ value: user.ratingScore - 33, color: "#10b981" }]}
                label="Rating"
              />
              <CircularScore
                score={user.relationScore - 21}
                maxScore={250}
                radius={50}
                strokeWidth={10}
                segments={[
                  { value: user.relationScore - 21, color: "#3b82f6" },
                ]}
                label="Relation"
              />
            </div>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* two cards. card 1: GOod Morning, Wil */}
          <Card>
            {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
            <CardContent>
              <p>Good Morning,</p>
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
      </div>
    </>
  );
}
