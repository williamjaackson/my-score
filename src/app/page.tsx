import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Fingerprint } from "lucide-react";
import MyScore from "./components/MyScore";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RedirectType } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  const decodedToken = jwt.decode(token || "");
  const userId =
    typeof decodedToken === "object" &&
    decodedToken !== null &&
    "userId" in decodedToken
      ? (decodedToken.userId as string)
      : undefined;

  if (!userId) {
    // redirect to /register
    return redirect("/register", RedirectType.replace);
  }

  const name = await prisma?.user
    .findUnique({
      where: { id: userId },
      select: { name: true },
    })
    .then((user) => user?.name || "Unknown User");
  const firstName = name?.split(" ")[0];

  return (
    <>
      <div className="md:p-4">
        <Card className="w-min mx-auto md:my-10 rounded-full">
          <CardContent>
            <MyScore />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4 mt-10">
          {/* two cards. card 1: GOod Morning, Wil */}
          <Card className="min-h-screen md:min-h-0">
            {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
            <CardContent>
              <p>Good Morning,</p>
              <p className="text-2xl font-semibold">{name}</p>
            </CardContent>
          </Card>
          <Card className="hidden md:block">
            {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
            <CardContent>
              <p>Good Morning,</p>
              <p className="text-2xl font-semibold">William Jackson</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  return "children";

  return (
    <div className="bg-secondary grid min-h-screen relative">
      <div className="relative w-full pb-20">
        {/* Background Fingerprint */}
        <Fingerprint className="text-secondary-foreground absolute top-20 right-30 transform rotate-[30deg] scale-1600" />

        {/* Header */}
        <header className="text-white text-xl flex gap-1 font-semibold pl-6 pt-6 pb-3">
          <Fingerprint className="text-logo rotate-[20deg]" />
          <p>myScore</p>
        </header>

        {/* User Card */}
        <Card className="mx-6 relative mb-6">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {firstName}&apos;s Score
              <Separator className="mt-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MyScore />
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <Card className="rounded-t-3xl p-6 relative h-full">
          <main>
            <p>Good Morning,</p>
            <p className="text-2xl font-semibold">William Jackson</p>
          </main>
        </Card>
      </div>
    </div>
  );
}
