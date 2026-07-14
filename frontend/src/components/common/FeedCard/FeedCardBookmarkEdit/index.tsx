"use client";
import React from "react";
import FeedBookmark from "../../FeedBookmark";
import { LFGItemType } from "@/@types/lfg.type";
import Link from "next/link";
import { EditOutlineIcon } from "../../icons";
import Button from "@/components/base/Button";

type Props = {
  item: LFGItemType;
  isOwner?: boolean;
};

const FeedCardBookmarkEdit: React.FC<Props> = ({ item, isOwner }) => {
  const encodedLfgId = encodeURIComponent(String(item.id));

  if (isOwner || item.user.id === 1) {
    return (
      <Button
        as={Link}
        href={`/lfg/${encodedLfgId}/edit`}
        variant="light"
        radius="full"
        size="sm"
        className="p-0 min-w-0 w-fit aspect-square"
      >
        <EditOutlineIcon className="w-5 h-5 text-white/50" />
      </Button>
    );
  }
  return (
    <FeedBookmark
      lfgId={item.id}
      isInitiallyBookmarked={item.isBookmarked}
    />
  );
};

export default FeedCardBookmarkEdit;
