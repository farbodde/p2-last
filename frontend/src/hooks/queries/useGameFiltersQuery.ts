"use client";

import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getGameCategories, getGameModes } from "@/services/content.service";

export const useGameFiltersQuery = (gameId: string | null) => {
  const [categoriesQuery, modesQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.gameCategories(gameId ?? ""),
        queryFn: () => getGameCategories(gameId ?? ""),
        enabled: Boolean(gameId),
      },
      {
        queryKey: queryKeys.gameModes(gameId ?? ""),
        queryFn: () => getGameModes(gameId ?? ""),
        enabled: Boolean(gameId),
      },
    ],
  });

  return {
    categoriesQuery,
    modesQuery,
  };
};
