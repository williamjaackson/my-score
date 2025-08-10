import { useToken } from "@/hooks/useToken";
import { redirect } from "next/navigation";

export default async function ProfileMe() {
  const { userId } = await useToken();
  return redirect(`/profile/${userId}`);
}
