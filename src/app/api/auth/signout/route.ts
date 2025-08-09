import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Create a redirect response to "/"
  const response = NextResponse.redirect(new URL("/", request.url), 302);

  // Clear the session cookie by setting it to an empty value and a past expiration date
  response.cookies.set("session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Set to -1 to delete the cookie
  });

  return response;
}
