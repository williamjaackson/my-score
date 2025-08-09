"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingType } from "@/generated/prisma";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";

interface RatingCardProps {
  rating: {
    id: string;
    comment?: string | null;
    createdAt: Date;
    rating: RatingType;
    author: { id: string; name: string };
    target: { id: string; name: string };
  };
  mode: "received" | "given";
}

export function RatingCard({ rating, mode }: RatingCardProps) {
  const isReceived = mode === "received";
  const profileId = isReceived ? rating.author.id : rating.target.id;

  const sentimentIcon =
    rating.rating === "POSITIVE" ? (
      <ArrowUpCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
    ) : (
      <ArrowDownCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
    );

  return (
    <Link
      href={`/profile/${profileId}`}
      className="block hover:opacity-90 transition"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
          {sentimentIcon}
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium">
              {rating.author.name} → {rating.target.name}
            </CardTitle>
            <p className="text-xs text-gray-500">
              {format(new Date(rating.createdAt), "dd/MM/yyyy")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm">{rating.comment || "No comment provided"}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
