"use client";

import React, { useEffect, useState } from "react";
import CircularScore from "@/components/score/Score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScoreApiResponse {
  criminalScore: number;
  otherScore: number;
  relationScore: number;
  ratingScore: number;
  totalScore: number;
  rating: number; // running average 0..1
  ratingsReceived?: Array<{
    id: string;
    rating: "POSITIVE" | "NEGATIVE";
    comment: string | null;
    createdAt: string;
    authorId: string;
    targetId: string;
  }>;
  totalRatings?: number;
}

export function ProfileScoreDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<ScoreApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    async function run() {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${userId}/score`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load score (${res.status})`);
        const json = await res.json();
        if (!aborted) setData(json);
      } catch (e: any) {
        if (!aborted) setError(e.message || "Unknown error");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <Card className="animate-pulse bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-medium tracking-wide text-gray-500">
            Loading Score Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-gray-200 dark:bg-zinc-800"
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Individual scores (for bars)
  const scoreParts = [
    { label: "Criminal", value: data.criminalScore, color: "#ef4444" },
    { label: "Other", value: data.otherScore, color: "#8b5cf6" },
    { label: "Rating", value: data.ratingScore, color: "#10b981" },
    { label: "Relation", value: data.relationScore, color: "#3b82f6" },
  ];

  const positive =
    data.ratingsReceived?.filter((r) => r.rating === "POSITIVE").length || 0;
  const negative = (data.totalRatings || 0) - positive;
  const ratingPercent = (data.rating * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Total Score Ring */}
      <Card className="border shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center justify-center">
            {/* Use a single aggregate segment so the ring fill represents total progress */}
            <CircularScore
              sepScore={data.totalScore}
              maxScore={1000}
              radius={80}
              strokeWidth={18}
              segments={[{ value: data.totalScore, color: "#f59e0b" }]}
              showScore={true}
              scoreFontSize="2.25rem"
            />
          </div>
          <div className="flex-1 w-full grid gap-4 grid-cols-2">
            {scoreParts.map((p) => (
              <MetricBox
                key={p.label}
                label={p.label}
                value={p.value}
                color="text-gray-600 dark:text-gray-300"
                barColor={p.color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ratings & Sentiment */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Ratings{" "}
              <Badge variant="secondary">{data.totalRatings}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto pr-1 thin-scrollbar">
            {!data.ratingsReceived || data.ratingsReceived.length === 0 ? (
              <p className="text-sm text-gray-500">No ratings yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.ratingsReceived.slice(0, 12).map((r) => (
                  <li
                    key={r.id}
                    className="group rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition bg-white dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full tracking-wide ${
                          r.rating === "POSITIVE"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {r.rating}
                      </span>
                      <time className="text-[10px] uppercase text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {r.comment || "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-600 font-medium">Positive</span>
                <span className="text-gray-500">{positive}</span>
              </div>
              <ProgressBar
                colorClasses="bg-emerald-500"
                pct={
                  data.totalRatings
                    ? (positive / (data.totalRatings || 1)) * 100
                    : 0
                }
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-500 font-medium">Negative</span>
                <span className="text-gray-500">{negative}</span>
              </div>
              <ProgressBar
                colorClasses="bg-red-500"
                pct={
                  data.totalRatings
                    ? (negative / (data.totalRatings || 1)) * 100
                    : 0
                }
              />
            </div>
            <div className="pt-2 border-t border-dashed">
              <p className="text-xs text-gray-500">Average Sentiment</p>
              <p className="text-lg font-semibold tracking-tight">
                {ratingPercent}%
              </p>
              <p className="text-[10px] uppercase text-gray-400">
                (Running average)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  color,
  barColor,
}: {
  label: string;
  value: number;
  color: string;
  barColor: string; // hex or tailwind color utility
}) {
  const pct = Math.min(100, (value / 250) * 100);
  return (
    <div className="rounded-lg p-3 bg-white dark:bg-zinc-900 border">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[11px] font-medium tracking-wide ${color}`}>
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function ProgressBar({
  pct,
  colorClasses,
}: {
  pct: number;
  colorClasses: string;
}) {
  return (
    <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
      <div
        className={`h-full ${colorClasses} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default ProfileScoreDashboard;
