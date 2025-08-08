"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  Home as HomeIcon,
  MapPin,
  MessageSquareMore,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/reviews", label: "Reviews", icon: MessageSquareMore },
    { href: "/community", label: "Community", icon: MapPin },
    { href: "/friends", label: "Friends", icon: Users },
  ];

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-secondary`}
      >
        <div className="bg-slate-100">
          <div className="bg-white min-h-screen max-w-md mx-auto overflow-hidden relative">
            {children}

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur shadow-lg max-w-md mx-auto z-50">
              <Card className="p-0 rounded-none shadow-none">
                <div className="flex justify-around items-center py-3">
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive =
                      pathname === href ||
                      (href !== "/" && pathname.startsWith(href));

                    return (
                      <Link
                        key={href}
                        href={href}
                        className="flex flex-col items-center"
                      >
                        <Button
                          variant="ghost"
                          className={`flex flex-col items-center gap-1 transition-colors ${
                            isActive
                              ? "text-blue-600"
                              : "text-gray-500 hover:text-blue-600"
                          }`}
                        >
                          <Icon size={26} />
                          <span className="text-xs font-medium">{label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </nav>
          </div>
        </div>
      </body>
    </html>
  );
}
