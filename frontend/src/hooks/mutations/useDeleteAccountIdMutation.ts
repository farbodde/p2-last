"use client";

import type { AccountIDListResponse } from "@/@types/accountID.type";
import { queryKeys } from "@/lib/query-keys";
import { deleteAccountId } from "@/services/account-id.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteAccountIdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: number) => deleteAccountId(accountId),
    onMutate: async (accountId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accountIds });

      const previousAccountIds =
        queryClient.getQueryData<AccountIDListResponse>(queryKeys.accountIds);

      queryClient.setQueryData<AccountIDListResponse>(
        queryKeys.accountIds,
        (current = []) => current.filter((item) => item.id !== accountId),
      );

      return { previousAccountIds };
    },
    onError: (_error, _accountId, context) => {
      if (context?.previousAccountIds !== undefined) {
        queryClient.setQueryData(
          queryKeys.accountIds,
          context.previousAccountIds,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accountIds });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};
