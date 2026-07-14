"use client";

import type { CreateAccountIDPayload } from "@/@types/accountID.type";
import { queryKeys } from "@/lib/query-keys";
import { createAccountId } from "@/services/account-id.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateAccountIdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountIDPayload) => createAccountId(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accountIds });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};
