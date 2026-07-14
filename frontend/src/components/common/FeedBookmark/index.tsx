"use client";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/base/Button";
import { ArchiveIcon, ArchiveTickIcon } from "../icons";
import { useLfgBookmarkMutation } from "@/hooks/mutations/useLfgBookmarkMutations";
import type { LfgBookmarkId } from "@/services/lfg-bookmark.service";

type FeedBookmarkProps = {
  lfgId: LfgBookmarkId;
  isInitiallyBookmarked?: boolean;
};

const FeedBookmark = ({
  lfgId,
  isInitiallyBookmarked = false,
}: FeedBookmarkProps) => {
  const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked);
  const bookmarkMutation = useLfgBookmarkMutation();

  useEffect(() => {
    setIsBookmarked(isInitiallyBookmarked);
  }, [isInitiallyBookmarked]);

  const handleChange = useCallback(async () => {
    console.log("Bookmark button clicked. Current state:", {
      bookmarkMutation,
      isBookmarked,
    });
    if (bookmarkMutation.isPending) {
      return;
    }

    const nextIsBookmarked = !isBookmarked;
    setIsBookmarked(nextIsBookmarked);

    try {
      await bookmarkMutation.mutateAsync({
        lfgId,
        shouldBookmark: nextIsBookmarked,
      });
    } catch {
      setIsBookmarked(isBookmarked);
    }
  }, [bookmarkMutation, isBookmarked, lfgId]);

  return (
    <Button
      variant="light"
      radius="full"
      size="sm"
      onPress={handleChange}
      isDisabled={bookmarkMutation.isPending}
      isLoading={bookmarkMutation.isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark LFG"}
      className="p-0 min-w-0 w-fit aspect-square"
    >
      {isBookmarked ? (
        <ArchiveTickIcon className="w-5 h-5 text-white/70" />
      ) : (
        <ArchiveIcon className="w-5 h-5 text-white/50" />
      )}
    </Button>
  );
};

export default FeedBookmark;
