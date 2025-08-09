"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ScoreData {
  totalScore: number;
  criminalScore: number;
  otherScore: number;
  ratingScore: number;
  relationScore: number;
}

interface ScoreContextType {
  score: ScoreData | null;
  loading: boolean;
  userId: string | null;
}

const ScoreContext = createContext<ScoreContextType>({
  score: null,
  loading: true,
  userId: null,
});

export const useScore = () => useContext(ScoreContext);

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      const userId = userData.userId;
      setUserId(userId);
      const scoreRes = await fetch(`/api/users/${userId}/score`);
      const scoreData = await scoreRes.json();
      setScore(scoreData);
      setLoading(false);
    }
    fetchScore();
  }, []);

  return (
    <ScoreContext.Provider value={{ score, loading, userId }}>
      {children}
    </ScoreContext.Provider>
  );
};
