"use client";

import CircularScore from "@/components/score/Score";
import { Card, CardContent } from "@/components/ui/card";



export default function TotalScore({totalScore, loading}: { totalScore: number, loading: boolean }) {

  return (
    <Card className="w-fit mx-auto md:my-10 rounded-full">
      <CardContent className="flex gap-4">
        <CircularScore
          sepScore={loading ? 0 : totalScore}
          maxScore={1000}
          radius={80}
          strokeWidth={15}
          segments={[{ value: loading ? 0 : totalScore, color: "#f5de0e" }]}
          showScore={true}
          scoreFontSize="2.5rem"
        />
      </CardContent>
    </Card>
  );
}
