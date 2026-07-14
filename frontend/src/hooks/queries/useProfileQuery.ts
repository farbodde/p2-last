"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getProfile } from "@/services/profile.service";

export const useProfileQuery = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled,
  });
