"use client";
import React from "react";
import Button from "@/components/base/Button";
import Link from "next/link";
import { LFGDetailViewData } from "@/@types/lfg.type";
import MyLFGFooter from "../MyLFGFooter";

type Props = {
  data: LFGDetailViewData;
  isOwner: boolean;
};

const LFGFooter: React.FC<Props> = ({ data, isOwner }) => {
  if (isOwner) {
    return (
      <MyLFGFooter
        key={`${data.id}-${data.canBump}-${data.remainingBumpMinutes}`}
        data={data}
      />
    );
  }

  return (
    <div className="flex border-t border-white/5 gap-4 p-4">
      <Link
        href={`/gamer/${encodeURIComponent(data.ownerUsername)}`}
        className="flex-1 shrink-0"
      >
        <Button fullWidth color="primary" className="bg-[#252932]">
          Profile
        </Button>
      </Link>
      <Link
        href={`/chat/${encodeURIComponent(data.ownerUsername)}?lfg=${encodeURIComponent(data.id)}`}
        className="flex-1 shrink-0"
      >
        <Button fullWidth color="primary">
          Chat
        </Button>
      </Link>
    </div>
  );
};

export default LFGFooter;
