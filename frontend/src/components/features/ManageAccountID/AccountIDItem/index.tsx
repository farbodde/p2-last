import React, { useCallback, useState } from "react";
import BottomSheet from "@/components/base/BottomSheet";
import Button from "@/components/base/Button";
import { GameIcon, TrashIcon } from "@/components/common/icons";
import Image from "next/image";
import type { AccountID } from "@/@types/accountID.type";
import { useDeleteAccountIdMutation } from "@/hooks/mutations/useDeleteAccountIdMutation";
import { getApiErrorList } from "@/helpers/api-error";
import { addToast } from "@heroui/react";

type Props = {
  data: AccountID;
  platformTitle: string | null;
  platformLogo: string | null;
};

const AccountIDItem: React.FC<Props> = ({
  platformLogo,
  platformTitle,
  data,
}) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const deleteAccountIdMutation = useDeleteAccountIdMutation();

  const handleDelete = useCallback(async () => {
    if (deleteAccountIdMutation.isPending) {
      return;
    }

    try {
      await deleteAccountIdMutation.mutateAsync(data.id);
      setOpenDeleteConfirm(false);
      addToast({
        title: "Account ID deleted",
        description: `${data.username} was removed successfully.`,
        color: "success",
        severity: "success",
      });
    } catch (error) {
      addToast({
        title: "Unable to delete Account ID",
        description: getApiErrorList(
          error,
          "Failed to delete Account ID. Please try again.",
        ).join(" "),
        color: "danger",
        severity: "danger",
      });
    }
  }, [data.id, data.username, deleteAccountIdMutation]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-black/30  p-3">
        <div className="flex items-center text-white font-medium gap-3">
          {platformLogo ? (
            <Image
              src={platformLogo}
              alt={platformTitle || data.username}
              width={40}
              height={40}
              unoptimized={
                platformLogo.startsWith("http://") ||
                platformLogo.startsWith("https://")
              }
              className="h-8 w-8 object-contain rounded-md"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <GameIcon className="h-5 w-5" />
            </span>
          )}
          <span className="text-sm font-bold">{data.username}</span>
        </div>
        <Button
          radius="full"
          className="aspect-square min-w-0 p-0 bg-transparent text-white/50"
          onPress={() => setOpenDeleteConfirm(true)}
          isDisabled={deleteAccountIdMutation.isPending}
          aria-label={`Delete ${data.username} Account ID`}
        >
          <TrashIcon className="w-5 h-5" />
        </Button>
      </div>
      <BottomSheet
        isOpen={openDeleteConfirm}
        onClose={() => {
          if (!deleteAccountIdMutation.isPending) {
            setOpenDeleteConfirm(false);
          }
        }}
      >
        <div className="flex flex-col gap-8 p-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Delete Account ID</h3>
            <p>
              Are you sure you want to delete this account ID? This action is
              irreversible.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              fullWidth
              color="danger"
              isLoading={deleteAccountIdMutation.isPending}
              isDisabled={deleteAccountIdMutation.isPending}
              onPress={handleDelete}
            >
              Delete
            </Button>
            <Button
              fullWidth
              onPress={() => setOpenDeleteConfirm(false)}
              isDisabled={deleteAccountIdMutation.isPending}
              className="bg-[#252932] text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

export default AccountIDItem;
