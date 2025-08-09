import { useToken } from "@/hooks/useToken";
import prisma from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingCard } from "./RatingCard";

export default async function Ratings() {
  const { userId } = await useToken();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ratingsReceived: {
        include: { author: true, target: true },
      },
      ratingsGiven: {
        include: { author: true, target: true },
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">Ratings Received</TabsTrigger>
          <TabsTrigger value="given">Ratings Given</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {user?.ratingsReceived?.length ? (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {user.ratingsReceived.map((rating) => (
                <RatingCard key={rating.id} rating={rating} mode="received" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white text-center mt-4">
              You haven't received any ratings yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="given">
          {user?.ratingsGiven?.length ? (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {user.ratingsGiven.map((rating) => (
                <RatingCard key={rating.id} rating={rating} mode="given" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white text-center mt-4">
              You haven't given any ratings yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
