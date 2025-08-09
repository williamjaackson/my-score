"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RateUserForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [self, setSelf] = useState(false);

  useEffect(() => {
    setError(null);
  }, [rating, comment]);

  useEffect(() => {
    async function checkSelf() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json?.userId && json.userId === profileId) setSelf(true);
      } catch {}
    }
    checkSelf();
  }, [profileId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (self) return;
    setSubmitting(true);
    setError(null);
    toast.dismiss();
    try {
      const res = await fetch(`/api/users/${profileId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit rating");
      toast.success("Review submitted");
      setComment("");
      setTimeout(() => router.push(`/profile/${profileId}`), 600);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-lg">Review User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRating(1)}
                disabled={submitting || self}
                className={`flex-1 h-12 rounded-md border text-sm font-medium transition ${
                  rating === 1
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-zinc-800 text-emerald-600 border-emerald-600"
                } ${self ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Positive
              </button>
              <button
                type="button"
                onClick={() => setRating(-1)}
                disabled={submitting || self}
                className={`flex-1 h-12 rounded-md border text-sm font-medium transition ${
                  rating === -1
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white dark:bg-zinc-800 text-red-600 border-red-600"
                } ${self ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Negative
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-md border bg-white dark:bg-zinc-800 text-sm p-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-200 disabled:opacity-50"
                placeholder="Share more context..."
                maxLength={280}
                disabled={submitting || self}
              />
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>{comment.length}/280</span>
                <span>{rating === 1 ? "Positive" : "Negative"} rating</span>
              </div>
            </div>
            {self && (
              <p className="text-xs text-yellow-600">
                You cannot rate yourself.
              </p>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting || self}
                className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/profile/${profileId}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
