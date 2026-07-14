import { getGamerMetadata } from "@/services/seo.service";
import Profile from "@/components/features/Profile";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;

  return getGamerMetadata(username);
}

const GamerProfilePage = async ({ params }: PageProps) => {
  const { username } = await params;

  return <Profile username={username} />;
};

export default GamerProfilePage;
