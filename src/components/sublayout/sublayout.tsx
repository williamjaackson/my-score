import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Fingerprint } from "lucide-react";

interface LayoutProps {
  title?: string;
  userName?: string;
  children: ReactNode;
}

export default function Layout({ title = "My Score", children }: LayoutProps) {
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

        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-white ml-6 mt-6 mb-3 relative">
          {title}
        </h1>

        {/* Main Content Area */}
        <Card className="rounded-t-3xl p-6 relative h-full">
          <main>{children}</main>
        </Card>
      </div>
    </div>
  );
}
