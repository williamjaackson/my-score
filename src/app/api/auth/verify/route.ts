import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  const userId = request.headers.get("x-user-id");
  if (!userId)
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || user.email)
    return NextResponse.json(
      { error: "User already has an email" },
      { status: 400 }
    );

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  // Create response with session cookie
  const response = NextResponse.json(
    {
      message: "Auth details added successfully",
      user: { id: user.id, name: user.name, email: user.email },
    },
    { status: 201 }
  );

  return response;
}
