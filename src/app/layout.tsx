"use client";

// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  Fingerprint,
  Home as HomeIcon,
  MapPin,
  MessageSquareMore,
  Users,
} from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";

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
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0`}
      >
        <div className="flex min-h-screen bg-secondary">
          {/* Sidebar for desktop */}
          <aside className="z-10 hidden md:flex flex-col w-64 bg-white text-gray-900 p-4 border-r border-gray-200">
            <Logo className="mb-4 p-2 mx-auto" theme="light" />
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 pb-16 md:pb-4 pattern-bg relative overflow-hidden">
            {/* Background text container */}
            <div className="select-none whitespace-nowrap pointer-events-none opacity-1 absolute inset-0 overflow-hidden">
              <p className="font-extrabold text-secondary-foreground absolute top-20 right-30 transform rotate-[30deg] scale-1600 hidden md:block">
                ALWAYS
              </p>
              <p className="font-extrabold text-secondary-foreground absolute top-50 right-80 transform rotate-[30deg] scale-1600 hidden md:block">
                WATCHING
              </p>
              <p className="font-extrabold text-secondary-foreground absolute top-80 right-130 transform rotate-[30deg] scale-1600 hidden md:block">
                GOTOSLEEP
              </p>
              <p className="font-extrabold text-secondary-foreground absolute top-110 right-180 transform rotate-[30deg] scale-1600 hidden md:block">
                MYLIFEMYSCORE
              </p>
              <p className="font-extrabold text-secondary-foreground absolute top-140 right-240 transform rotate-[30deg] scale-1600 hidden md:block">
                RATEEVERYTHING
              </p>
              <p className="font-extrabold text-secondary-foreground absolute top-180 right-290 transform rotate-[30deg] scale-1600 hidden md:block">
                NOESCAPE
              </p>
            </div>
            <div className="relative">{children}</div>
          </main>

          {/* Bottom nav for mobile */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 flex justify-around items-center py-2 border-t border-gray-200 md:hidden">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center group"
                >
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-600 shadow"
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <span
                    className={`text-xs mt-1 font-medium transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </body>
    </html>
  );
}
