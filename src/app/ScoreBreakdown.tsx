"use client";

import CircularScore from "@/components/score/Score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useEffect, useState } from "react";

export default function ScoreBreakdown() {
  const [scores, setScores] = useState<{ [key: string]: number }>({
    criminal: 0,
    other: 0,
    rating: 0,
    relation: 0,
  });

  useEffect(() => {
    async function fetchScore() {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      const userId = userData.userId;
      const scoreRes = await fetch(`/api/users/${userId}/score`);
      const scoreData = await scoreRes.json();
      setScores({
        criminal: scoreData.criminalScore,
        other: scoreData.otherScore,
        rating: scoreData.ratingScore,
        relation: scoreData.relationScore,
      });
    }
    fetchScore();
  }, []);

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Scores Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Scores Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 justify-center">
          <CircularScore
            score={scores.criminal}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[{ value: scores.criminal, color: "#ef4444" }]}
            label="Criminal"
          />
          <CircularScore
            score={scores.other}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[{ value: scores.other, color: "#8b5cf6" }]}
            label="Other"
          />
          <CircularScore
            score={scores.rating}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[{ value: scores.rating, color: "#10b981" }]}
            label="Rating"
          />
          <CircularScore
            score={scores.relation}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[{ value: scores.relation, color: "#3b82f6" }]}
            label="Relation"
          />
        </div>
      </CardContent>
    </Card>
  );
}
