"use client";
import Link from "next/link";
import Button from "@/components/base/Button";
import Header from "@/components/layouts/Header";
import AccountIDItem from "@/components/features/ManageAccountID/AccountIDItem";
import { AddIcon } from "@/components/common/icons";
import { useAccountIdsQuery } from "@/hooks/queries/useAccountIdsQuery";
import { useFilterConfigQuery } from "@/hooks/queries/useFilterConfigQuery";

const AccountIDsPage = () => {
  const accountIdsQuery = useAccountIdsQuery();
  const filterConfigQuery = useFilterConfigQuery();
  const isLoading = accountIdsQuery.isLoading;
  const isError = accountIdsQuery.isError;
  const error = accountIdsQuery.error;
  const platformsById = new Map(
    (filterConfigQuery.data?.platforms ?? []).map((platform) => [
      platform.id,
      platform,
    ]),
  );

  return (
    <>
      <Header
        hasBack
        title="Manage Account IDs"
        rightComponent={
          <Button
            as={Link}
            href="/profile/accountids/create"
            radius="full"
            className="aspect-square min-w-0 p-0 bg-transparent text-white"
          >
            <AddIcon className="w-6 h-6" />
          </Button>
        }
      />
      <section className="flex flex-col">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="mx-3 h-16 animate-pulse border-b border-black/30 bg-white/5"
              />
            ))
          : null}

        {isError ? (
          <div className="m-4 flex flex-col items-center gap-4 rounded-lg border border-danger/30 bg-danger/10 p-4 text-center">
            <span className="text-sm text-danger">
              {error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
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

        {!isLoading && !isError && filterConfigQuery.isError ? (
          <div className="mx-4 mt-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Platform details could not be loaded. Showing platform IDs instead.
          </div>
        ) : null}

        {!isLoading && !isError && (accountIdsQuery.data?.length ?? 0) === 0 ? (
          <div className="m-4 rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
            No Account IDs added yet.
          </div>
        ) : null}

        {!isError
          ? accountIdsQuery.data?.map((accountId) => {
              const platform = platformsById.get(accountId.platform);

              return (
                <AccountIDItem
                  key={accountId.id}
                  data={accountId}
                  platformTitle={
                    platform?.title ?? `Platform ${accountId.platform}`
                  }
                  platformLogo={platform?.logo || null}
                />
              );
            })
          : null}
      </section>
    </>
  );
};

export default AccountIDsPage;
