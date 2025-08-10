import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;
 const token = request.cookies.get("session-token")?.value;
  if (!token)
    return NextResponse.json({ error: "Session token is required" }, { status: 400 });

  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "JWT secret is not configured" }, { status: 500 });
  }
  const user = jwt.verify(token, process.env.JWT_SECRET) as { id?: string; email?: string; name?: string };

  if (!user || !user.id)
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );

  if (user.email)
    return NextResponse.json(
      { error: "User already has an email" },
      { status: 400 }
    );

  await prisma.user.update({
    where: { id: user.id },
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
