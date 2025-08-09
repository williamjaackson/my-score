"use client";

import { useScore } from "@/components/score/ScoreContext";
import Link from "next/dist/client/link";

export default function ViewPublicProfile() {
  const { userId } = useScore();
  return <Link href={`/profile/${userId}`}>View Public Profile</Link>;
}
