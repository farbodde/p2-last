"use client";

import { useEffect, useMemo, useRef } from "react";
import FeedCard from "@/components/common/FeedCard";
import Alert from "@/components/common/Alert";
import { getApiErrorList } from "@/helpers/api-error";
import { useProfileLfgsQuery } from "@/hooks/queries/useProfileLfgsQuery";

type Props = {
  username?: string;
};

const ProfileLFGs = ({ username }: Props) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isResolvingUser,
    userError,
  } = useProfileLfgsQuery(username);
  const feeds = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data?.pages],
  );
  const queryError = error ?? userError;
  const errorMessage = queryError
    ? getApiErrorList(
        queryError,
        "Failed to load LFG posts. Please try again.",
      )[0]
    : "";

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-l font-semibold">
        {username ? "LFGs" : "My LFGs"}
      </h2>

      <div className="flex flex-col gap-4 mb-10">
        {errorMessage ? (
          <Alert
            type="error"
            title="Unable to load LFGs"
            message={errorMessage}
            dismissible={false}
          />
        ) : null}

        {feeds.map((item) => (
          <FeedCard key={item.id} item={item} isOwner={!username} />
        ))}

        {(isLoading || isResolvingUser) && !feeds.length ? (
          <div className="py-8 text-center text-sm text-white/50">
            Loading LFG posts...
          </div>
        ) : null}

        {!isLoading &&
        !isResolvingUser &&
        !errorMessage &&
        !feeds.length ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/50">
            No LFG posts yet.
          </div>
        ) : null}

        <div
          ref={loadMoreRef}
          className="flex min-h-8 items-center justify-center text-xs text-white/40"
        >
          {isFetchingNextPage && "Loading more..."}
          {!hasNextPage && feeds.length > 0 && "You are all caught up."}
        </div>
      </div>
    </section>
  );
};

export default ProfileLFGs;
