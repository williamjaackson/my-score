import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // , email, password

  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name,
    },
  });


  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );

  // Create response with session cookie
  const response = NextResponse.json(
    {
      message: "User created successfully",
      user: { id: user.id, name: user.name },
    },
    { status: 201 }
  );

  response.cookies.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400, // 24 hours
    path: "/",
  });

  return response;
}
