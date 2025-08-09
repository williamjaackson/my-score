import { useToken } from "@/hooks/useToken";
import prisma from "@/lib/prisma";

export default async function Ratings() {
  const { userId } = await useToken();

  const ratings = await prisma.user.findUnique({
    where: { id: userId },
    include: { ratingsReceived: true },
  });

  return (
    <>
      {ratings?.ratingsReceived.map((rating) => (
        <div key={rating.id} className="border-b border-gray-200 py-4">
          <p className="text-sm text-gray-600">{rating.comment}</p>
          <p className="text-xs text-gray-400">
            {rating.createdAt.toLocaleDateString()}
          </p>
        </div>
      ))}
    </>
  );
}
