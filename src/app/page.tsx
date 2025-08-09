import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Fingerprint } from "lucide-react";
import MyScore from "./components/MyScore";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RedirectType } from "next/navigation";
import { useToken } from "@/hooks/useToken";

export default async function Home() {
  const { name } = await useToken();

  return (
    <>
      <div className="p-4">
        <Card className="w-fit mx-auto md:my-10 rounded-full">
          <CardContent className="flex gap-4">
            <MyScore />
          </CardContent>
        </Card>
        <Separator className="my-4" />
        <div className="grid md:grid-cols-2 gap-4 mt-10">
          {/* two cards. card 1: GOod Morning, Wil */}
          <Card>
            {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
            <CardContent>
              <p>Good Morning,</p>
              <p className="text-2xl font-semibold">{name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You have no tasks for today.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
