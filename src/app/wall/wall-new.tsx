"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewWallPostForm() {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submit() {
    if (!content.trim()) return;
    const res = await fetch("/api/wall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      toast.error("Failed to post");
      return;
    }
    setContent("");
    toast.success("Posted");
    // simple refresh
    window.location.reload();
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something..."
        className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={500}
        rows={3}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{content.length}/500</span>
      </div>
      <Button
        disabled={isPending || !content.trim()}
        onClick={() => startTransition(submit)}
      >
        Post
      </Button>
    </div>
  );
}
