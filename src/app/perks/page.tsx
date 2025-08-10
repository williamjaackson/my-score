import { NextRequest } from "next/server";
import PerksPageComponent from "./PerksPage";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";


export default async function PerksPage() {
  const token = (await cookies()).get("session-token")?.value;
  if (!token || !process.env.JWT_SECRET) 
    return redirect("/login");
  
  const {id: userId } = jwt.verify(token, process.env.JWT_SECRET) as { id?: string; email?: string; name?: string };

 const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      otherScore: true,
      criminalScore: true,
      relationScore: true,
      ratingScore: true,
    },
  });

  const totalScore = user
    ? user.otherScore + user.criminalScore + user.relationScore + user.ratingScore
    : 0;
  return <PerksPageComponent score={{ totalScore }} />;
}
