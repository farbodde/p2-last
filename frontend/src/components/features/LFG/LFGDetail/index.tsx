"use client";

import type { ComponentType } from "react";
import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LFGDetailViewData, LFGSelectedItem } from "@/@types/lfg.type";
import BackButton from "@/components/common/BackButton";
import FeedBookmark from "@/components/common/FeedBookmark";
import {
  AwardIcon,
  BoxIcon,
  ChevronRightIcon,
  CrossPlayIcon,
  CupIcon,
  DriverIcon,
  GpsIcon,
  MicOffIcon,
  MicOnIcon,
  PCIcon,
  RankingIcon,
  StarIcon,
} from "@/components/common/icons";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import { hasAuthSession, subscribeToAuthSession } from "@/lib/auth";
import LFGFooter from "./LFGFooter";

type Props = {
  data: LFGDetailViewData;
};

type DetailIcon = ComponentType<{ className?: string }>;

const categoryIcons: Record<string, DetailIcon> = {
  goal: GpsIcon,
  language: DriverIcon,
  playstyle: StarIcon,
  rank: AwardIcon,
  region: DriverIcon,
  role: BoxIcon,
  session: CupIcon,
};

const subscribeToClientReady = () => () => undefined;

const groupSelectedItems = (items: LFGSelectedItem[]) =>
  items.reduce<Record<string, string[]>>((groups, item) => {
    const category = item.category.trim() || "Other";

    groups[category] = [...(groups[category] ?? []), item.title];

    return groups;
  }, {});

const formatCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeUsername = (username: string | null | undefined) =>
  username?.trim().toLowerCase() ?? "";

const LFGDetail = ({ data }: Props) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasAuthSession,
    () => false,
  );
  const profileQuery = useProfileQuery({ enabled: isAuthenticated });
  const isOwner =
    isAuthenticated &&
    Boolean(profileQuery.data?.username) &&
    normalizeUsername(profileQuery.data?.username) ===
      normalizeUsername(data.ownerUsername);
  const hasResolvedOwnership =
    isClient &&
    (!isAuthenticated || profileQuery.isSuccess || profileQuery.isError);
  const selectedItemGroups = Object.entries(
    groupSelectedItems(data.selectedItems),
  );
  const details = [
    ...(data.gameModeTitle
      ? [
          {
            key: "mode",
            label: "Mode",
            value: data.gameModeTitle,
            icon: CupIcon,
          },
        ]
      : []),
    ...selectedItemGroups.map(([category, items]) => ({
      key: category,
      label: category,
      value: items.join(", "),
      icon: categoryIcons[category.toLowerCase()] ?? RankingIcon,
    })),
  ];
  const scrollToImage = (index: number) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const nextIndex = (index + data.statImages.length) % data.statImages.length;

    carousel.scrollTo({
      left: carousel.clientWidth * nextIndex,
      behavior: "smooth",
    });
    setActiveImage(nextIndex);
  };

  return (
    <section className="relative">
      <div className="absolute top-0 left-0 w-full h-60">
        <Image
          src="/images/games/battlefield-bg.png"
          alt=""
          width={512}
          height={512}
          priority
          className="w-full h-full object-cover object-center mask-[linear-gradient(to_bottom,rgba(0,0,0,0.25),rgba(0,0,0,0))]"
        />
      </div>

      <div className="relative min-h-screen flex flex-col gap-10 z-10">
        <section className="flex px-4 pt-4 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <Link
                href={
                  isOwner
                    ? "/profile"
                    : `/gamer/${encodeURIComponent(data.ownerUsername)}`
                }
                className="flex items-center gap-2"
              >
                <span className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className="font-normal text-white/70">
                  @{data.ownerUsername}
                </span>
              </Link>
            </div>

            {hasResolvedOwnership && !isOwner ? (
              <FeedBookmark lfgId={data.id} />
            ) : null}
          </div>

          <p className="min-h-12 text-sm text-white/80 font-normal whitespace-pre-wrap dir-detect">
            {data.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="flex gap-1.5 p-1.5 border border-white/10 text-white/80 rounded-lg items-center">
              {data.allowCrossPlay ? (
                <CrossPlayIcon className="w-5 h-5 text-primary" />
              ) : data.platformTitle.toLowerCase() === "pc" ? (
                <PCIcon className="w-5 h-5 text-white/70" />
              ) : null}
              <span className="leading-[normal] text-sm font-medium">
                {data.platformTitle}
              </span>
            </span>

            <span className="flex gap-1.5 p-1.5 border border-white/10 rounded-lg items-center">
              {data.micEnabled ? (
                <MicOnIcon className="w-5 h-5 text-success-2" />
              ) : (
                <MicOffIcon className="w-5 h-5 text-danger" />
              )}
              <span className="text-sm text-white/70">
                {data.micEnabled ? "Mic on" : "Mic off"}
              </span>
            </span>

            {data.allowCrossPlay ? (
              <span className="p-1.5 border border-white/10 text-sm text-white/70 rounded-lg">
                Cross-play
              </span>
            ) : null}
          </div>
        </section>

        {details.length ? (
          <section className="px-4 flex flex-col gap-4">
            {details.map(({ icon: Icon, ...item }) => (
              <div key={item.key} className="flex items-center gap-4">
                <span className="flex items-center justify-center bg-white/5 w-9 h-9 rounded-md">
                  <Icon className="w-6 h-6 text-white/40" />
                </span>
                <div className="flex flex-col">
                  <span className="text-white/30 font-normal">
                    {item.label}
                  </span>
                  <span className="text-white/80 font-medium">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {data.statImages.length ? (
          <section className="px-4">
            <div className="relative">
              <div
                ref={carouselRef}
                onScroll={(event) => {
                  const carousel = event.currentTarget;

                  if (carousel.clientWidth) {
                    setActiveImage(
                      Math.round(carousel.scrollLeft / carousel.clientWidth),
                    );
                  }
                }}
                className="flex w-full snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {data.statImages.map((image, index) => (
                  <div
                    key={image}
                    className="relative aspect-video min-w-full snap-center overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${data.gameTitle} stats ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover object-center"
                    />
                  </div>
                ))}
              </div>
              {/* 
              {data.statImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => scrollToImage(activeImage - 1)}
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                  >
                    <ChevronRightIcon className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => scrollToImage(activeImage + 1)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              ) : null} */}
            </div>

            {data.statImages.length > 1 ? (
              <div className="mt-3 hidden md:flex justify-center gap-2">
                {data.statImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-current={activeImage === index ? "true" : undefined}
                    onClick={() => scrollToImage(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImage === index
                        ? "w-6 bg-white/80"
                        : "w-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="sticky mt-auto bg-background/90 backdrop-blur-[2px] bottom-0 left-0 border-t border-dashed border-white/10">
          <div className="flex flex-col bg-black/20">
            <div className="flex items-center justify-between gap-4 py-3 px-8">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md overflow-hidden">
                  <Image
                    src="/images/controller.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </span>
                <span className="text-sm text-white/80 font-normal">
                  {data.gameTitle}
                </span>
              </span>

              <time
                dateTime={data.createdAt}
                className="text-white/30 text-xs font-normal"
              >
                {formatCreatedAt(data.createdAt)}
              </time>
            </div>

            {hasResolvedOwnership ? (
              <LFGFooter data={data} isOwner={isOwner} />
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
};

export default LFGDetail;
