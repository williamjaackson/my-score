"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  Fingerprint,
  Home as HomeIcon,
  MapPin,
  MessageSquareMore,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-secondary">
          {/* Sidebar for desktop */}
          <aside className="hidden md:flex flex-col w-64 bg-white text-gray-900 p-4 border-r border-gray-200">
            <Logo className="mb-6 mx-auto" theme="light" />
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
          <main className="flex-1 p-4 pb-16 md:pb-4">{children}</main>
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

// <div className="bg-slate-100">
//           {/* Mobile Container */}
//           <div className="bg-white min-h-screen mx-auto overflow-hidden relative md:hidden">
//             {children}

//             {/* Mobile Bottom Navigation Bar */}
//             <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur shadow-lg mx-auto z-50">
//               <Card className="p-0 rounded-none shadow-none">
//                 <div className="flex justify-around items-center py-3">
//                   {navItems.map(({ href, label, icon: Icon }) => {
//                     const isActive =
//                       pathname === href ||
//                       (href !== "/" && pathname.startsWith(href));

//                     return (
//                       <Link
//                         key={href}
//                         href={href}
//                         className="flex flex-col items-center"
//                       >
//                         <Button
//                           variant="ghost"
//                           className={`flex flex-col items-center gap-1 transition-colors ${
//                             isActive
//                               ? "text-blue-600"
//                               : "text-gray-500 hover:text-blue-600"
//                           }`}
//                         >
//                           <Icon size={26} />
//                           <span className="text-xs font-medium">{label}</span>
//                         </Button>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               </Card>
//             </nav>
//           </div>

//           {/* Desktop Container */}
//           <div className="hidden md:block bg-white min-h-screen">
//             {/* Desktop Side Navigation */}
//             <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
//               <div className="p-6">
//                 {/* Logo */}
//                 <div className="flex items-center gap-2 mb-8">
//                   <Fingerprint
//                     className="text-blue-600 rotate-[20deg]"
//                     size={32}
//                   />
//                   <span className="text-2xl font-semibold">myScore</span>
//                 </div>

//                 {/* Navigation Items */}
//                 <div className="space-y-2">
//                   {navItems.map(({ href, label, icon: Icon }) => {
//                     const isActive =
//                       pathname === href ||
//                       (href !== "/" && pathname.startsWith(href));

//                     return (
//                       <Link key={href} href={href}>
//                         <Button
//                           variant={isActive ? "secondary" : "ghost"}
//                           className={`w-full justify-start gap-3 h-12 ${
//                             isActive
//                               ? "bg-blue-50 text-blue-600 border-blue-200"
//                               : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
//                           }`}
//                         >
//                           <Icon size={20} />
//                           <span className="font-medium">{label}</span>
//                         </Button>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               </div>
//             </nav>

//             {/* Desktop Main Content */}
//             <main className="ml-64 min-h-screen">{children}</main>
//           </div>
//         </div>
