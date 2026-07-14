import React from "react";
import Image from "next/image";
import { GenderEnum, OnlineStatusEnum } from "@/@types/general.type";
import clsx from "clsx";
import { LFGItemType } from "@/@types/lfg.type";
import Link from "next/link";
import FeedCardBookmarkEdit from "./FeedCardBookmarkEdit";
import {
  CrossPlayIcon,
  FemaleIcon,
  MaleIcon,
  MicOffIcon,
  MicOnIcon,
  PCIcon,
  RankingIcon,
  SoundIcon,
} from "../icons";

type Props = {
  isOwner?: boolean;
  item: LFGItemType;
};

const FeedCard: React.FC<Props> = ({ item, isOwner }) => {
  const encodedLfgId = encodeURIComponent(String(item.id));
  const optionEntries = Object.entries(item.options)
    .filter(([key]) => key !== "platform" && key !== "mic")
    .map(([key, val]) => ({ key, val }));
  const visibleOptions = optionEntries.slice(0, 3);
  const remainingOptionsCount = optionEntries.length - visibleOptions.length;

  // const linkUser =
  //   isOwner || item.user.id === 1 ? `/profile` : `/gamer/${item.user.id}`;
  const linkUser = isOwner ? `/profile` : `/gamer/${item.user.username}`;

  return (
    <div className="flex flex-col bg-gray-500/5 pt-4 gap-3 w-full shadow rounded-xl">
      <div className="flex items-start px-4 justify-between gap-4">
        <Link href={linkUser} className="flex items-center gap-2">
          <span
            className={clsx("w-10 h-10 rounded-full border-2 overflow-hidden", {
              "border-white/5": item.user.status === OnlineStatusEnum.OFFLINE,
              "border-warning": item.user.status === OnlineStatusEnum.AWAY,
              "border-success": item.user.status === OnlineStatusEnum.ONLINE,
            })}
          >
            <Image
              src={item.user.imageUrl}
              alt={item.user.username}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </span>

          <span className="flex flex-col">
            <span className="flex gap-1.5 items-center">
              <span className="text-sm font-normal text-white/70">
                {item.user.username}
              </span>
              <Image
                src="/images/flags/iran.png"
                alt="iran"
                width={16}
                height={16}
                className="w-4 object-container opacity-70"
              />
            </span>
            <span className="flex gap-1 items-center text-white/60">
              <SoundIcon className="w-3 h-3" />
              <span className="text-xs font-light">{item.user.language}</span>
            </span>
          </span>
        </Link>

        <FeedCardBookmarkEdit item={item} isOwner={isOwner} />
      </div>
      <Link
        href={`/lfg/${encodedLfgId}`}
        className="flex flex-col gap-3 w-full"
      >
        <div
          className="px-4 min-h-12 text-sm font-normal text-white/80 dir-detect"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />

        <span className="flex gap-2 px-4">
          <span className="flex gap-1.5 p-1.5 border border-dashed border-white/10 text-white/80 rounded-lg items-center">
            {item.user.gender === GenderEnum.MALE && (
              <MaleIcon className="w-5 h-5" />
            )}
            {item.user.gender === GenderEnum.FEMALE && (
              <FemaleIcon className="w-5 h-5" />
            )}
            <span className="leading-[normal] text-sm font-medium">
              {item.user.age}
            </span>
          </span>

          <span className="flex gap-1.5 p-1.5 border border-dashed border-white/10 text-white/80 rounded-lg items-center">
            {item.options.crossPlay && (
              <CrossPlayIcon className="w-5 h-5 text-primary" />
            )}
            {!item.options.crossPlay && (
              <>
                {item.options.platform?.toLowerCase() === "pc" && (
                  <PCIcon className="w-5 h-5 border-white/10" />
                )}
              </>
            )}

            <span className="leading-[normal] text-sm font-medium">
              {item.options.platform}
            </span>
          </span>

          <span className="flex gap-1.5 p-1.5 border border-dashed border-white/10 rounded-lg items-center">
            {item.options.mic ? (
              <MicOnIcon className="w-5 h-5 text-success-2" />
            ) : (
              <MicOffIcon className="w-5 h-5 text-danger" />
            )}
          </span>

          <span className="flex gap-1.5 p-1.5 border border-dashed border-white/15 rounded-lg text-[#FACC15] items-center">
            <RankingIcon className="w-5 h-5 " />
          </span>
        </span>

        <span className="flex gap-4">
          <span className="block w-1 rounded-r-2xl bg-[#505563]" />

          <span className="flex h-full flex-1 -ml-1 gap-4">
            {visibleOptions.map((opt) => (
              <span key={opt.key} className="flex w-1/4 flex-col">
                <span className="text-sm text-white/30 font-normal capitalize">
                  {opt.key}
                </span>
                <span className="text-sm font-medium text-white/80">
                  {opt.val}
                </span>
              </span>
            ))}

            {remainingOptionsCount > 0 && (
              <span className="flex ml-auto items-center justify-center bg-[#32353E] text-white/80 rounded-lg text-sm font-medium w-9 h-9">
                +{remainingOptionsCount}
              </span>
            )}
          </span>

          <span className="block w-1 rounded-l-2xl bg-[#505563]" />
        </span>

        <span className="border-t border-dashed-long border-white/10 py-3 px-4 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md overflow-hidden">
              <Image
                src={item.game.imageUrl}
                alt={item.game.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </span>
            <span className="text-sm text-white/80 font-normal">
              {item.game.name}
            </span>
          </span>

          <span className="text-white/30 text-xs">{item.date}</span>
        </span>
      </Link>
    </div>
  );
};

export default FeedCard;
