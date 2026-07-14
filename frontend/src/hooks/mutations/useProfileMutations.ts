"use client";

import type { UpdateProfilePayload } from "@/@types/profile.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { updateProfile } from "@/services/profile.service";

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile, profile);
    },
  });
};
