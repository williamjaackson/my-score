// app/profile/[profileId]/page.tsx
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CircularScore from "@/components/score/Score"; // ✅ Import our new component

export default async function ProfilePage({
  params,
}: {
  params: { profileId: string };
}) {
  const { profileId } = await params;

  const profile = await prisma.user.findUnique({
    where: { id: profileId },
    include: {
      ratingsReceived: { include: { author: true } },
      relatedUsers: { include: { user: true } },
      criminalRecords: true,
    },
  });

  if (!profile) {
    return <p className="text-center text-gray-500">Profile not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="w-fit rounded-full mx-auto">
        <CardContent>
          <CircularScore
            score={879}
            maxScore={1000}
            radius={80}
            strokeWidth={15}
            segments={[{ value: 879, color: "#f5de0e" }]}
            // label="Total Score"
            showScore={true}
            scoreFontSize="2.5rem"
            // labelFontSize="1rem"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scores Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Scores Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 justify-center">
            <CircularScore
              score={profile.criminalScore - 33}
              maxScore={250}
              radius={50}
              strokeWidth={10}
              segments={[
                { value: profile.criminalScore - 33, color: "#ef4444" },
              ]}
              label="Criminal"
            />
            <CircularScore
              score={profile.otherScore - 34}
              maxScore={250}
              radius={50}
              strokeWidth={10}
              segments={[{ value: profile.otherScore - 34, color: "#8b5cf6" }]}
              label="Other"
            />
            <CircularScore
              score={profile.ratingScore - 33}
              maxScore={250}
              radius={50}
              strokeWidth={10}
              segments={[{ value: profile.ratingScore - 33, color: "#10b981" }]}
              label="Rating"
            />
            <CircularScore
              score={profile.relationScore - 21}
              maxScore={250}
              radius={50}
              strokeWidth={10}
              segments={[
                { value: profile.relationScore - 21, color: "#3b82f6" },
              ]}
              label="Relation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ratings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ratings Received</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.ratingsReceived.length === 0 ? (
            <p className="text-gray-500">No ratings yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.ratingsReceived.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>{rating.author.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rating.rating === "POSITIVE"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {rating.rating}
                      </Badge>
                    </TableCell>
                    <TableCell>{rating.comment || "-"}</TableCell>
                    <TableCell>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Criminal Records */}
      <Card>
        <CardHeader>
          <CardTitle>Criminal Records</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.criminalRecords.length === 0 ? (
            <p className="text-gray-500">No criminal records</p>
          ) : (
            <ul className="space-y-2">
              {profile.criminalRecords.map((record) => (
                <li
                  key={record.id}
                  className="p-3 border rounded-md bg-gray-50 flex justify-between"
                >
                  <div>
                    <p className="font-medium">{record.description}</p>
                    <p className="text-sm text-gray-500">
                      Severity: {record.severity || "N/A"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {record.date
                      ? new Date(record.date).toLocaleDateString()
                      : "No date"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
