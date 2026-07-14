"use client";
import { createMetadata } from "@/config/metadata.config";
import GamesSkeleton from "@/components/common/GamesSkeleton";
import HomeView from "@/components/features/Home";
import MainHeader from "@/components/layouts/MainHeader";
import { Suspense } from "react";
import { mapLfgFeedSearchParamsToFilters } from "@/services/content.service";
import type { LFGFeedSearchParams } from "@/services/content.service";

type PageProps = {
  searchParams: Promise<LFGFeedSearchParams>;
};

const getErrorLogPayload = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  return { error };
};

// export const metadata = createMetadata({
//   title: "Home",
//   description:
//     "Browse recent LFG posts, discover players, and find your next squad on Player2.",
//   path: "/",
//   keywords: ["home feed", "discover gamers", "teammates"],
// });

export default async function HomePage({ searchParams }: PageProps) {
  let resolvedSearchParams: LFGFeedSearchParams;
  let activeGameKey: string | null;
  let feedFilters: ReturnType<typeof mapLfgFeedSearchParamsToFilters>;

  try {
    resolvedSearchParams = await searchParams;
    const { game } = resolvedSearchParams;
    activeGameKey = Array.isArray(game) ? game[0] : (game ?? null);
    feedFilters = mapLfgFeedSearchParamsToFilters(resolvedSearchParams);
  } catch (error) {
    console.error("[HomePage] Failed to resolve home page params", {
      error: getErrorLogPayload(error),
    });
    throw error;
  }

  return (
    <Suspense
      fallback={
        <>
          <MainHeader />
          <GamesSkeleton />
        </>
      }
    >
      <HomeView activeGameKey={activeGameKey} feedFilters={feedFilters} />
    </Suspense>
  );
}
