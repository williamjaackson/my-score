// app/profile/[profileId]/page.tsx
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProfileScoreDashboard from "@/components/profile/ProfileScoreDashboard";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  const profile = await prisma.user.findUnique({
    where: { id: profileId },
    include: {
      ratingsReceived: { include: { author: true } },
      relatedUsers: true,
      criminalRecords: true,
    },
  });

  if (!profile) {
    return <p className="text-center text-gray-500">Profile not found</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header (no gradients) */}
      <div className="rounded-3xl border bg-white dark:bg-zinc-900 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div>
          <Avatar className="h-24 w-24 ring-2 ring-gray-200 dark:ring-zinc-700 shadow">
            <AvatarFallback className="text-xl font-semibold bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200">
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 w-full space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Joined {new Date(profile.createdAt).toLocaleDateString()} •
                Updated {new Date(profile.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/profile/${profile.id}/rate`}
                className="inline-flex items-center justify-center rounded-md border bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
              >
                Review User
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-[11px]">
              User ID: {profile.id.slice(0, 8)}…
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              Ratings: {profile.ratingsReceived.length}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              Relations: {profile.relatedUsers.length}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              Criminal Records: {profile.criminalRecords.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Dynamic Score Dashboard (client) */}
      <ProfileScoreDashboard userId={profile.id} />
    </div>
  );
}
