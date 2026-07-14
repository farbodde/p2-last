import { getLfgDetail } from "@/services/lfg.service";
import { getLfgMetadata } from "@/services/seo.service";
import LFGDetail from "@/components/features/LFG/LFGDetail";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return getLfgMetadata(id);
}

const LFGDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const lfg = await getLfgDetail(numericId);

  if (!lfg) {
    notFound();
  }

  return <LFGDetail data={lfg} />;
};

export default LFGDetailPage;
