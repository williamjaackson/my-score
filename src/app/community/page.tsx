"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface UserProfile {
  name: string;
  ratingScore: number;
  relationScore: number;
  criminalScore: number;
  otherScore: number;
}

interface NearbyUser {
  id: string;
  distance: number;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  totalTimeSpentNear: number;
  currentlyInProximity: boolean;
  profile: UserProfile;
}

export default function CommunityPage() {
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearby() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/location/nearby");
        if (!res.ok) throw new Error("Failed to fetch nearby users");
        const data = await res.json();
        setUsers(data.nearbyUsers || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchNearby();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Community Nearby</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="block"
            passHref
          >
            <Card className="flex flex-col cursor-pointer hover:ring-2 hover:ring-primary transition">
              <CardHeader className="flex flex-row items-center gap-4">
                {/* <Avatar className="w-12 h-12 text-xl">
                  {user.profile?.name?.[0] || "?"}
                </Avatar> */}
                <div>
                  <CardTitle>{user.profile?.name || "Unknown"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {user.currentlyInProximity
                      ? "Currently nearby"
                      : "Not nearby"}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4 text-sm">
                    <span>Distance: {user.distance}m</span>
                    <span>Total time near: {user.totalTimeSpentNear} min</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span>Rating: {user.profile.ratingScore}</span>
                    <span>Relation: {user.profile.relationScore}</span>
                    <span>Criminal: {user.profile.criminalScore}</span>
                    <span>Other: {user.profile.otherScore}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {!loading && users.length === 0 && !error && (
        <p className="text-center text-white mt-8">No users nearby.</p>
      )}
    </div>
  );
}
