import RateUserForm from "./RateUserForm";

export default async function RateUserPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  return <RateUserForm profileId={profileId} />;
}
