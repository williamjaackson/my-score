"use client";

import CircularScore from "@/components/score/Score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreData {
  totalScore: number;
  criminalScore: number;
  otherScore: number;
  ratingScore: number;
  relationScore: number;
}


export default function ScoreBreakdown({score, loading}: {score: ScoreData, loading: boolean}) {

  const scores = {
    criminal: score?.criminalScore ?? 0,
    other: score?.otherScore ?? 0,
    rating: score?.ratingScore ?? 0,
    relation: score?.relationScore ?? 0,
  };

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Scores Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Scores Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 justify-center">
          <CircularScore
            sepScore={loading ? 0 : scores.rating}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[
              { value: loading ? 0 : scores.rating, color: "#10b981" },
            ]}
            label="Rating"
          />
          <CircularScore
            sepScore={loading ? 0 : scores.relation}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[
              { value: loading ? 0 : scores.relation, color: "#3b82f6" },
            ]}
            label="Community"
          />
          <CircularScore
            sepScore={loading ? 0 : scores.criminal}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[
              { value: loading ? 0 : scores.criminal, color: "#ef4444" },
            ]}
            label="Criminal"
          />
          <CircularScore
            sepScore={loading ? 0 : scores.other}
            maxScore={250}
            radius={50}
            strokeWidth={10}
            segments={[{ value: loading ? 0 : scores.other, color: "#8b5cf6" }]}
            label="Other"
          />
        </div>
      </CardContent>
    </Card>
  );
}
