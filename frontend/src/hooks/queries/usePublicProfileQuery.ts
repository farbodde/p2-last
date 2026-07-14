"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getPublicProfile } from "@/services/profile.service";

export const usePublicProfileQuery = (username: string) =>
  useQuery({
    queryKey: queryKeys.publicProfile(username),
    queryFn: () => getPublicProfile(username),
    enabled: Boolean(username),
  });
