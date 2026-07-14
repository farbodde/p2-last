"use client";

import { queryKeys } from "@/lib/query-keys";
import { getLfgDetail } from "@/services/lfg.service";
import { useQuery } from "@tanstack/react-query";

export const useLfgDetailQuery = (lfgId: number | null) =>
  useQuery({
    queryKey: queryKeys.lfgDetail(lfgId ?? ""),
    queryFn: () => getLfgDetail(lfgId as number),
    enabled: lfgId !== null,
  });
