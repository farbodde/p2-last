"use client";

import FeedCard from "@/components/common/FeedCard";
import BookmarkGameFilter from "@/components/features/Bookmarks/BookmarkGameFilter";
import HomeFilters from "@/components/features/Home/HomeFilters";
import Header from "@/components/layouts/Header";
import type { FilterBookmarkedLFGRequest } from "@/@types/lfg.type";
import { queryKeys } from "@/lib/query-keys";
import { getBookmarkedLfgs } from "@/services/lfg-bookmark.service";
import {
  mapLfgFeedSearchParamsToFilters,
  type LFGFeedSearchParams,
} from "@/services/content.service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const mapSearchParamsToBookmarkFilters = (
  searchParams: LFGFeedSearchParams,
): FilterBookmarkedLFGRequest => {
  const filters = mapLfgFeedSearchParamsToFilters(searchParams);
  const game = filters.game === undefined ? undefined : Number(filters.game);
  const nonCategoryKeys = new Set([
    "game",
    "platforms",
    "consoles",
    "platform",
    "quickSelections",
    "country",
    "languages",
    "language",
    "age_min",
    "ageMin",
    "age_max",
    "ageMax",
    "page",
    "modes",
  ]);
  const categories = Object.entries(searchParams)
    .filter(([key]) => !nonCategoryKeys.has(key))
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .flatMap((value) => value?.split(",") ?? [])
    .map(Number)
    .filter(Number.isFinite);

  return {
    ...filters,
    game: Number.isFinite(game) ? game : undefined,
    categories: categories.length ? categories : undefined,
  };
};

const BookmarksView = () => {
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filters = useMemo(
    () =>
      mapSearchParamsToBookmarkFilters(
        Object.fromEntries(searchParams.entries()),
      ),
    [searchParams],
  );
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.bookmarksFeed(filters),
    queryFn: ({ pageParam }) =>
      getBookmarkedLfgs({
        page: pageParam,
        filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
  });
  const feedItems = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data?.pages],
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
    <>
      <Header title="Saved LFG" />
      <BookmarkGameFilter />
      <HomeFilters includeGameModes={false} />

      <section className="flex flex-col gap-4 mb-10 px-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-xl bg-white/5"
              />
            ))
          : null}

        {feedItems.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}

        {!isLoading && !isError && !feedItems.length ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/50">
            No saved LFG posts match these filters.
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error instanceof Error
              ? error.message
              : typeof error === "string"
                ? error
                : "Failed to load saved LFG posts."}
          </div>
        ) : null}

        <div
          ref={loadMoreRef}
          className="flex min-h-8 items-center justify-center text-xs text-white/40"
        >
          {isFetchingNextPage ? "Loading more..." : null}
          {!hasNextPage && feedItems.length > 0
            ? "You are all caught up."
            : null}
        </div>
      </section>
    </>
  );
};

export default BookmarksView;
