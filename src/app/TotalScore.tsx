"use client";

import CircularScore from "@/components/score/Score";
import { Card, CardContent } from "@/components/ui/card";

import { useEffect, useState } from "react";

export default function TotalScore() {
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    async function fetchScore() {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      const userId = userData.userId;
      const scoreRes = await fetch(`/api/users/${userId}/score`);
      const scoreData = await scoreRes.json();
      setScore(scoreData.totalScore);
    }
    fetchScore();
  }, []);

  return (
    <Card className="w-fit mx-auto md:my-10 rounded-full">
      <CardContent className="flex gap-4">
        <CircularScore
          score={score}
          maxScore={1000}
          radius={80}
          strokeWidth={15}
          segments={[{ value: score, color: "#f5de0e" }]}
          showScore={true}
          scoreFontSize="2.5rem"
        />
      </CardContent>
    </Card>
  );
}
