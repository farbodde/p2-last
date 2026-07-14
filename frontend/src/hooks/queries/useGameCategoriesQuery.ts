"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getGameCategories } from "@/services/content.service";

export const useGameCategoriesQuery = (gameId: number | null) =>
  useQuery({
    queryKey: queryKeys.gameCategories(gameId === null ? "" : String(gameId)),
    queryFn: () => getGameCategories(String(gameId)),
    enabled: gameId !== null,
  });
