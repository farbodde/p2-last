"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getGameModes } from "@/services/content.service";

export const useGameModesQuery = (gameId: number | null) =>
  useQuery({
    queryKey: queryKeys.gameModes(gameId === null ? "" : String(gameId)),
    queryFn: () => getGameModes(String(gameId)),
    enabled: gameId !== null,
  });
