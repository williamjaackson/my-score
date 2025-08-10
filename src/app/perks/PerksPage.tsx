"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CircularScore from "@/components/score/Score";
import { CheckCircle, Lock, AlertTriangle, ShieldAlert } from "lucide-react";

export default function PerksPageComponent({ score }: { score: { totalScore: number }}) {
  const totalScore = score?.totalScore ?? 0;
    
  // Final dystopian perks
  const perks = [
    { text: "Priority Healthcare Access", minScore: 400, icon: "🏥" },
    { text: "International Travel Approval", minScore: 800, icon: "✈️" },
    { text: "Luxury Consumption License", minScore: 650, icon: "💎" },
    { text: "Exclusive Social Events Access", minScore: 500, icon: "🎭" },
  ];

  // Final dystopian punishments
  const punishments = [
    { text: "Score Rehabilitation Centre", maxScore: 200, icon: "🏢" },
    { text: "Curfew Enforcement", maxScore: 250, icon: "⏰" },
    { text: "Banking Restrictions", maxScore: 300, icon: "💳" },
    { text: "Digital Visibility Reduction", maxScore: 350, icon: "📉" },
  ];

  const nextPerk = perks.find((p) => totalScore < p.minScore);
  const progressToNext =
    nextPerk && nextPerk.minScore > 0
      ? Math.min((totalScore / nextPerk.minScore) * 100, 100)
      : 100;

  return (
  
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Rehabilitation Warning */}
        {totalScore <= 200 && (
          <div className="bg-red-600 text-white p-4 rounded-lg flex items-center gap-3 shadow-lg animate-pulse">
            <ShieldAlert size={24} className="text-white" />
            <div>
              <p className="font-bold uppercase tracking-wide">
                Mandatory Score Rehabilitation
              </p>
              <p className="text-sm opacity-90">
                You are required to attend a government-run re-education
                facility until your score improves.
              </p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Card className="rounded-full">
            <CardContent>
              <CircularScore
                sepScore={totalScore}
                maxScore={1000}
                radius={90}
                strokeWidth={16}
                segments={[{ value: totalScore, color: "#10b981" }]}
                showScore={true}
                scoreFontSize="2.5rem"
              />
            </CardContent>
          </Card>
          <Card className="mt-2">
            <CardContent>
              <p className="text-gray-500 text-sm">
                {nextPerk
                  ? `Only ${
                      nextPerk.minScore - totalScore
                    } points until you unlock: ${nextPerk.text}`
                  : "You’ve unlocked all perks!"}
              </p>
              {nextPerk && (
                <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Perks Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              🌟 Perks Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {perks.map((perk, i) => {
                const unlocked = totalScore >= perk.minScore;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border flex items-center gap-3 transition-all ${
                      unlocked
                        ? "bg-green-100 border-green-300 dark:bg-green-900/30"
                        : "bg-gray-50 border-gray-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span className="text-2xl">{perk.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          unlocked
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {perk.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        Requires {perk.minScore} points
                      </p>
                    </div>
                    {unlocked ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Lock className="text-gray-400" size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Punishments Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              ⚠️ Punishment Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {punishments.map((punish, i) => {
                const punished = totalScore <= punish.maxScore;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border flex items-center gap-3 transition-all ${
                      punished
                        ? "bg-red-100 border-red-300 dark:bg-red-900/30"
                        : "bg-gray-50 border-gray-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span className="text-2xl">{punish.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          punished
                            ? "text-red-700 dark:text-red-300"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {punish.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        Triggered if score ≤ {punish.maxScore}
                      </p>
                    </div>
                    {punished ? (
                      <AlertTriangle className="text-red-500" size={20} />
                    ) : (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

  );
}
