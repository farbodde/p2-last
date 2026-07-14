"use client";
import { useMemo, useState } from "react";
import LFGBetterMatchingForm from "@/components/features/LFG/LFGBetterMatchingForm";
import LFGForm from "@/components/features/LFG/LFGForm";
import { useParams } from "next/navigation";
import type { LFGFormData } from "@/@types/lfg.type";
import { useLfgDetailQuery } from "@/hooks/queries/useLfgDetailQuery";
import { useGamesQuery } from "@/hooks/queries/useGamesQuery";
import Header from "@/components/layouts/Header";
import Alert from "@/components/common/Alert";

const normalizeTitle = (value: string) => value.trim().toLowerCase();

const EditLFGPage = () => {
  const [step, setStep] = useState(1);
  const [lfgData, setLfgData] = useState<LFGFormData | null>(null);
  const params = useParams<{ id: string }>();
  const numericId = Number(params?.id);
  const lfgId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null;
  const lfgQuery = useLfgDetailQuery(lfgId);
  const gamesQuery = useGamesQuery();
  const initialData = useMemo(() => {
    if (!lfgQuery.data || !gamesQuery.data) {
      return null;
    }

    const detail = lfgQuery.data;
    const selectedGame =
      gamesQuery.data.find((game) => game.id === detail.gameId) ??
      gamesQuery.data.find(
        (game) => normalizeTitle(game.title) === normalizeTitle(detail.gameTitle),
      );
    const selectedPlatform =
      selectedGame?.platforms.find(
        (platform) => platform.id === detail.platformId,
      ) ??
      selectedGame?.platforms.find(
        (platform) =>
          normalizeTitle(platform.title) ===
          normalizeTitle(detail.platformTitle),
      );
    const skillItem = detail.selectedItems.find(
      (item) => normalizeTitle(item.category) === "skill",
    );

    if (!selectedGame || !selectedPlatform) {
      return null;
    }

    return {
      form: {
        gameId: selectedGame.id,
        platformId: selectedPlatform.id,
        allowCrossPlay: detail.allowCrossPlay,
        mic: detail.micEnabled,
        skill: skillItem ? String(skillItem.id) : "any",
        description: detail.description,
      } satisfies LFGFormData,
      detail: {
        ...detail,
        gameId: selectedGame.id,
        platformId: selectedPlatform.id,
      },
    };
  }, [gamesQuery.data, lfgQuery.data]);

  const handleLFGFormDone = (data: LFGFormData) => {
    setLfgData(data);
    setStep(2);
  };

  if (
    lfgId === null ||
    lfgQuery.isError ||
    gamesQuery.isError ||
    (lfgQuery.isSuccess && !lfgQuery.data) ||
    (lfgQuery.isSuccess && gamesQuery.isSuccess && !initialData)
  ) {
    const error = lfgQuery.error ?? gamesQuery.error;

    return (
      <section className="flex min-h-screen flex-col">
        <Header hasBack title="Edit LFG" />
        <div className="p-4">
          <Alert
            type="error"
            title="Unable to edit LFG"
            message={
              error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "The LFG data could not be loaded."
            }
            dismissible={false}
          />
        </div>
      </section>
    );
  }

  if (lfgQuery.isLoading || gamesQuery.isLoading || !initialData) {
    return (
      <section className="flex min-h-screen flex-col">
        <Header hasBack title="Edit LFG" />
        <div className="flex flex-col gap-6 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>
      </section>
    );
  }

  return step === 1 ? (
    <LFGForm
      id={lfgId}
      initialData={lfgData ?? initialData.form}
      onDone={handleLFGFormDone}
    />
  ) : (
    <LFGBetterMatchingForm
      id={lfgId}
      lfgData={lfgData}
      initialDetail={initialData.detail}
      onClose={() => setStep(1)}
    />
  );
};

export default EditLFGPage;
