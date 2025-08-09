"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScore, ScoreProvider } from "@/components/score/ScoreContext";
import CircularScore from "@/components/score/Score";

export default function PerksPage() {
  const { score, loading, userId } = useScore();
  const totalScore = score?.totalScore ?? 0;

  const perks = [
    { text: "Free Public Transport", minScore: 200 },
    { text: "Priority Healthcare Access", minScore: 400 },
    { text: "VIP Housing Allocation", minScore: 600 },
    { text: "International Travel Approval", minScore: 800 },
  ];

  const punishments = [
    { text: "Restricted Public Transport Access", maxScore: 150 },
    { text: "Healthcare Queue Delays", maxScore: 300 },
    { text: "Employment Restrictions", maxScore: 500 },
    { text: "International Travel Ban", maxScore: 700 },
  ];

  return (
    <ScoreProvider>
      <div className="p-4 max-w-3xl mx-auto">
        <div className="grid gap-4 mt-4">
          {/* Perks Card */}
          <Card>
            <CardHeader>
              <CardTitle>Perks Unlocked</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {perks.map((perk, i) => {
                  const unlocked = totalScore >= perk.minScore;
                  return (
                    <li
                      key={i}
                      className={`p-2 border rounded-md ${
                        unlocked
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <span
                        className={`${
                          unlocked
                            ? "text-green-700"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {perk.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Punishments Card */}
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Punishments Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {punishments.map((punish, i) => {
                  const punished = totalScore <= punish.maxScore;
                  return (
                    <li
                      key={i}
                      className={`p-2 border rounded-md ${
                        punished
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <span
                        className={`${
                          punished
                            ? "text-red-700"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {punish.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScoreProvider>
  );
}
