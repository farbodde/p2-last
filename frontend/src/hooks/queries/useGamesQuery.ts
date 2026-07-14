"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getGames } from "@/services/content.service";

export const useGamesQuery = () =>
  useQuery({
    queryKey: queryKeys.games,
    queryFn: () => getGames(),
  });
