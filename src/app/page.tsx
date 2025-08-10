"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

import Link from "next/link";


import TotalScore from "./TotalScore";
import ScoreBreakdown from "./ScoreBreakdown";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

interface ScoreData {
  totalScore: number;
  criminalScore: number;
  otherScore: number;
  ratingScore: number;
  relationScore: number;
}


export default function Home() {



  const { user } = useAuth();

 
    const [score, setScore] = useState<ScoreData | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchScore() {
  
      
        const userId = user?.id;
        if (!userId) return;
        const scoreRes = await fetch(`/api/users/${userId}/score`);
        const scoreData = await scoreRes.json();
      
        setScore(scoreData);
        setLoading(false);
      }
      fetchScore();
    }, [user]);

  const name = user?.name;
  const tasks = [];

  if (!user?.email)
    tasks.push({
      icon: <Lock className="h-4 w-4" />,
      text: "Add an authentication method.",
      link: "/verify",
    });

  return (
   
      <div className="p-4 max-w-3xl mx-auto">
        <TotalScore totalScore={score?.totalScore ?? 0} loading={loading} />
        <ScoreBreakdown score={score ?? {
          totalScore: 0,
          criminalScore: 0,
          otherScore: 0,
          ratingScore: 0,
          relationScore: 0,
        }} loading={loading} />
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
        {/* <div className="mx-auto w-fit my-4 text-white">
          <ViewPublicProfile />
        </div> */}
      </div>

  );
}
