import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Fingerprint } from "lucide-react";
import MyScore from "./components/MyScore";

export default function Home() {
  const name = "William Jackson";
  const firstName = name.split(" ")[0];

  return (
    <>
      <Card className="w-min mx-auto my-10 rounded-full">
        <CardContent>
          <MyScore />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4 mt-10">
        {/* two cards. card 1: GOod Morning, Wil */}
        <Card>
          {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
          <CardContent>
            <p>Good Morning,</p>
            <p className="text-2xl font-semibold">William Jackson</p>
          </CardContent>
        </Card>
        <Card>
          {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
          <CardContent>
            <p>Good Morning,</p>
            <p className="text-2xl font-semibold">William Jackson</p>
          </CardContent>
        </Card>
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
