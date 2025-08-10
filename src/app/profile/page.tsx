import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function ProfileMe() {
  const token = (await cookies()).get("session-token")?.value;
  if (!token || !process.env.JWT_SECRET) return redirect("/login");

  const { id: userId } = jwt.verify(token, process.env.JWT_SECRET) as {
    id?: string;
    email?: string;
    name?: string;
  };
  return redirect(`/profile/${userId}`);
}
