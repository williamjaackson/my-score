// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// const bcrypt = require("bcrypt");
// import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ userId: request.headers.get("x-user-id") });
}
