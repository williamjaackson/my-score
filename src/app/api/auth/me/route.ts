// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// const bcrypt = require("bcrypt");
 import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

 const token = request.cookies.get("session-token")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET as string;
    if (!jwtSecret) {
      return NextResponse.json({ user: null }, { status: 500 });
    }
    const decoded = jwt.verify(token, jwtSecret);
    return NextResponse.json({ user: decoded });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
