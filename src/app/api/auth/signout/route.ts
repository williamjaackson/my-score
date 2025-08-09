import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Clear the session cookie by setting it to an empty value and a past expiration date
  const response = NextResponse.json(
    { message: "Sign out successful" },
    { status: 200 }
  );

  response.cookies.set("session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Set to -1 to delete the cookie
  });

  return response;
}
