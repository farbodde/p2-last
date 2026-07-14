"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/base/Button";
import Alert from "@/components/common/Alert";
import Header from "@/components/layouts/Header";
import { getApiErrorList } from "@/helpers/api-error";
import { useBlockedUsersQuery } from "@/hooks/queries/useBlockedUsersQuery";

const BlockedUsersPage = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, isFetching } = useBlockedUsersQuery(page);
  const blockedUsers = data?.items ?? [];
  const errorMessage = error
    ? getApiErrorList(
        error,
        "Failed to load blocked users. Please try again.",
      )[0]
    : "";
  const totalPage = data?.totalPage ?? 1;
  const totalCount = data?.count ?? 0;
  const currentPage = data?.currentPage ?? page;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPage;

  return (
    <>
      <Header title="Blocked Users" hasBack />
      <section className="flex flex-col gap-4 p-4">
        {errorMessage ? (
          <Alert
            type="error"
            title="Unable to load blocked users"
            message={errorMessage}
            dismissible={false}
          />
        ) : null}

        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-black/20 py-3 last:border-b-0 animate-pulse"
            >
              <div className="flex flex-1 items-center gap-3">
                <span className="block h-14 w-14 rounded-full bg-white/10" />
                <div className="flex flex-col gap-2">
                  <span className="block h-4 w-28 rounded bg-white/10" />
                  <span className="block h-3 w-20 rounded bg-white/5" />
                </div>
              </div>
              <span className="block h-9 w-20 rounded-xl bg-white/10" />
            </div>
          ))
        ) : blockedUsers.length ? (
          blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 border-b border-black/20 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/5">
                  <Image
                    src={user.profileImage ?? "/images/icons/profile-circle.svg"}
                    alt={user.displayName}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div className="flex min-w-0 flex-col">
                  <h4 className="truncate font-medium text-white">
                    {user.displayName}
                  </h4>
                  <span className="truncate text-sm text-white/50">
                    {user.username ? `@${user.username}` : "No username"}
                  </span>
                </div>
              </div>
              <Button
                variant="bordered"
                className="border border-white/10 text-white/50"
                isDisabled
              >
                Blocked
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-white/60">
            You do not have any blocked users yet.
          </div>
        )}

        {totalCount > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/60">
              Page {currentPage} of {totalPage}
              <span className="ml-2 text-white/40">({totalCount} users)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="bordered"
                className="border-white/10 text-white/70"
                isDisabled={!canGoPrevious || isFetching}
                onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="bordered"
                className="border-white/10 text-white/70"
                isDisabled={!canGoNext || isFetching}
                onPress={() => setPage((prev) => Math.min(prev + 1, totalPage))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
};

export default BlockedUsersPage;
