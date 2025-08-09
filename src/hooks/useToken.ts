import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import jwt from "jsonwebtoken";

export async function useToken() {
  const token = (await cookies()).get("session-token")?.value;

  if (!token || !jwt.verify(token, process.env.JWT_SECRET!)) {
    redirect("/register");
  }

  const decodedToken = jwt.decode(token) as jwt.JwtPayload;
  if (!decodedToken) {
    redirect("/register");
  }

  const userId = decodedToken.userId;
  if (!userId) {
    redirect("/register", RedirectType.replace);
  }

  return decodedToken;
}
