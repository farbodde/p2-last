"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import FeedCard from "@/components/common/FeedCard";
import { getHomeFeed } from "@/services/content.service";
import type { LFGFeedFilters, LFGFeedPage } from "@/@types/lfg.type";
import { queryKeys } from "@/lib/query-keys";

type HomeFeedProps = {
  initialFeedPage: LFGFeedPage;
  filters: LFGFeedFilters;
};

const HomeFeed = ({ initialFeedPage, filters }: HomeFeedProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: queryKeys.homeFeed(filters),
    queryFn: ({ pageParam }) => getHomeFeed({ page: pageParam, filters }),
    initialData: {
      pages: [initialFeedPage],
      pageParams: [1],
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
  });

  const feedItems = useMemo(
    () => data.pages.flatMap((page) => page.results),
    [data.pages],
  );

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
    <section className="flex flex-col gap-4 mb-10 px-4">
      {feedItems.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}

      {!feedItems.length && (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/50">
          No LFG posts yet.
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error instanceof Error
            ? error.message
            : "Failed to load more LFG posts."}
        </div>
      )}

      <div
        ref={loadMoreRef}
        className="flex min-h-8 items-center justify-center text-xs text-white/40"
      >
        {isFetchingNextPage && "Loading more..."}
        {!hasNextPage && feedItems.length > 0 && "You are all caught up."}
      </div>
    </section>
  );
};

export default HomeFeed;
