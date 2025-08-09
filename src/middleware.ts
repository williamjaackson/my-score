import { NextRequest, NextResponse } from "next/server";

function base64urlDecode(str: string) {
  str += "=".repeat((4 - (str.length % 4)) % 4);

  str = str.replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array(Array.from(atob(str), (c) => c.charCodeAt(0)));
}

async function verifyJWT(token: string, secret: string) {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Invalid token format");
  }

  // Decode the payload
  const decodedPayload = JSON.parse(
    new TextDecoder().decode(base64urlDecode(payload))
  );

  // Check expiration
  if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
    throw new Error("Token expired");
  }

  // Create the signing input
  const signingInput = `${header}.${payload}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signingInput);

  // Import the secret key
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Verify the signature
  const signatureBytes = base64urlDecode(signature);
  const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);

  if (!isValid) {
    throw new Error("Invalid signature");
  }

  return decodedPayload;
}

export async function middleware(request: NextRequest) {
  // Get the session token from cookies
  const token = request.cookies.get("session-token")?.value;

  // Check if token exists
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await verifyJWT(token, process.env.JWT_SECRET!);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);

    // Continue with the request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/api/users/:path*",
    "/api/auth/(verify|me)",
    "/api/location/:path*",
  ],
};
