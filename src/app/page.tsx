import { Fingerprint, Home as HomeIcon, MapPin, Users } from "lucide-react";
import MyScore from "./components/MyScore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Home() {
  const name = "William Jackson";
  const firstName = name.split(" ")[0];

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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 shadow-lg max-w-lg mx-auto z-50">
        <div className="flex justify-around items-center py-3">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-blue-600 data-[active=true]:text-blue-700 transition-colors"
            data-active="true"
          >
            <HomeIcon size={26} />
            <span className="text-xs font-medium">Home</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MapPin size={26} />
            <span className="text-xs font-medium">Community</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Users size={26} />
            <span className="text-xs font-medium">Friends</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
