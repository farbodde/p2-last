"use client";

import React, { useState } from "react";
import BottomSheet from "@/components/base/BottomSheet";
import Button from "@/components/base/Button";
import Link from "next/link";
import {
  AddIcon,
  GameIcon,
  GameOutlineIcon,
  SettingOutlineIcon,
} from "@/components/common/icons";
import Image from "next/image";
import { useAccountIdsQuery } from "@/hooks/queries/useAccountIdsQuery";
import { useFilterConfigQuery } from "@/hooks/queries/useFilterConfigQuery";

const ChatAttachAccountID = () => {
  const [isOpen, setIsOpen] = useState(false);
  const accountIdsQuery = useAccountIdsQuery({ enabled: isOpen });
  const filterConfigQuery = useFilterConfigQuery({ enabled: isOpen });
  const platformsById = new Map(
    (filterConfigQuery.data?.platforms ?? []).map((platform) => [
      platform.id,
      platform,
    ]),
  );

  return (
    <>
      <Button
        radius="full"
        className="aspect-square min-w-0 bg-transparent p-0 text-white/50"
        onPress={() => setIsOpen(true)}
      >
        <GameOutlineIcon />
      </Button>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-4 pb-20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">Attach Account ID</h3>
              <p className="text-white/80">Select an ID to send to the chat</p>
            </div>

            <Button
              radius="full"
              className="aspect-square min-w-0 p-0 bg-transparent "
              as={Link}
              href="/profile/accountids"
            >
              <SettingOutlineIcon className="w-6 h-6 text-white" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 items-center">
            {accountIdsQuery.isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 w-full animate-pulse rounded-lg bg-white/5"
                  />
                ))
              : null}

            {accountIdsQuery.isError ? (
              <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-center">
                <span className="text-sm text-danger">
                  {accountIdsQuery.error instanceof Error
                    ? accountIdsQuery.error.message
                    : "Failed to load Account IDs. Please try again."}
                </span>
                <Button
                  color="danger"
                  variant="bordered"
                  isLoading={accountIdsQuery.isRefetching}
                  onPress={() => accountIdsQuery.refetch()}
                >
                  Try Again
                </Button>
              </div>
            ) : null}

            {!accountIdsQuery.isLoading &&
            !accountIdsQuery.isError &&
            (accountIdsQuery.data?.length ?? 0) === 0 ? (
              <div className="w-full rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
                No Account IDs added yet.
              </div>
            ) : null}

            {accountIdsQuery.data?.map((accountId) => {
              const platform = platformsById.get(accountId.platform);

              return (
                <Button
                  key={accountId.id}
                  fullWidth
                  variant="bordered"
                  className="h-fit text-white border-white/20 justify-start p-3"
                >
                  {platform?.logo ? (
                    <Image
                      src={platform.logo}
                      alt={platform.title}
                      width={40}
                      height={40}
                      unoptimized={
                        platform.logo.startsWith("http://") ||
                        platform.logo.startsWith("https://")
                      }
                      className="h-8 w-8 rounded-md object-contain"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black">
                      <GameIcon className="h-5 w-5" />
                    </span>
                  )}
                  <span className="text-sm font-semibold">
                    {accountId.username}
                  </span>
                </Button>
              );
            })}

            <Button
              fullWidth
              as={Link}
              href="/profile/accountids/create"
              variant="bordered"
              className="h-fit text-white/30 border-white/20 justify-start font-medium p-3"
            >
              <AddIcon />
              <span className="font-semibold text-sm">Add Account ID</span>
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

export default ChatAttachAccountID;
