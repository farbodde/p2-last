// @ts-nocheck
import React from "react";
import Button from "@/components/base/Button";
import Image from "next/image";
import clsx from "clsx";
import FeedBookmark from "@/components/common/FeedBookmark";
import BackButton from "@/components/common/BackButton";
import { LFGItemsMock } from "@/mocks/home.mock";
import { GenderEnum, OnlineStatusEnum } from "@/@types/general.type";
import MyLFGFooter from "./MyLFGFooter";
import {
  AwardIcon,
  BoxIcon,
  CrossPlayIcon,
  CupIcon,
  DriverIcon,
  FemaleIcon,
  GpsIcon,
  MaleIcon,
  MicOffIcon,
  MicOnIcon,
  PCIcon,
  RankingIcon,
  SoundIcon,
  StarIcon,
} from "@/components/common/icons";
import LFGFooter from "./LFGFooter";

type Props = {
  id: number;
};

const LFGDetail: React.FC<Props> = ({ id }) => {
  const data = LFGItemsMock.find((i) => i.id === id);

  const items = [
    {
      key: "mode",
      label: "Mode",
      value: "BattleRoyal",
      icon: CupIcon,
    },
    {
      key: "goals",
      label: "Goals",
      value: "Competetive, Casual",
      icon: GpsIcon,
    },
    {
      key: "skill",
      label: "Skill",
      value: "Intermediate, Pro",
      icon: StarIcon,
    },
    {
      key: "playstyle",
      label: "Playstyle",
      value: "Support",
      icon: BoxIcon,
    },
    {
      key: "rank",
      label: "Rank",
      value: "Cooper",
      icon: AwardIcon,
    },
    {
      key: "region",
      label: "Region",
      value: "EU Region",
      icon: DriverIcon,
    },
  ];

  return (
    <section className="relative">
      <div className="absolute top-0 left-0 w-full h-60">
        <Image
          src="/images/games/battlefield-bg.png"
          alt="battlefield"
          width={512}
          height={512}
          className="
        w-full h-full object-cover object-center
        mask-[linear-gradient(to_bottom,rgba(0,0,0,0.25),rgba(0,0,0,0))]
      "
        />
      </div>
      <div className="relative min-h-screen flex flex-col gap-10 z-10">
        <section className="flex px-4 pt-4 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-full border-2 overflow-hidden",
                    {
                      "border-white/5":
                        data?.user.status === OnlineStatusEnum.OFFLINE,
                      "border-warning":
                        data?.user.status === OnlineStatusEnum.AWAY,
                      "border-success":
                        data?.user.status === OnlineStatusEnum.ONLINE,
                    },
                  )}
                >
                  <Image
                    src={data?.user.imageUrl || ""}
                    alt={data?.user.username || ""}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="flex gap-1 items-center ">
                    <span className="font-normal text-white/70">
                      {data?.user.username}
                    </span>
                    <span>{data?.user.country}</span>
                  </span>
                  <span className="flex gap-1 items-center text-white/60">
                    <SoundIcon className="w-3 h-3" />
                    <span className="text-sm font-light">
                      {data?.user.language}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <FeedBookmark
              lfgId={data?.id ?? id}
              isInitiallyBookmarked={data?.isBookmarked}
            />
          </div>

          <div
            className="min-h-12 text-sm text-white/80 font-normal dir-detect"
            dangerouslySetInnerHTML={{ __html: data?.description || "" }}
          />

          <div>
            <div className="flex gap-2 ">
              <span className="flex gap-1.5 p-1.5 border border-white/10 text-white/80 rounded-lg items-center">
                {data?.user.gender === GenderEnum.MALE && (
                  <MaleIcon className="w-5 h-5" />
                )}
                {data?.user.gender === GenderEnum.FEMALE && (
                  <FemaleIcon className="w-5 h-5" />
                )}
                <span className="leading-[normal] text-sm font-medium">
                  {data?.user.age}
                </span>
              </span>

              <span className="flex gap-1.5 p-1.5 border border-white/10 text-white/80 rounded-lg items-center">
                {data?.options.crossPlay && (
                  <CrossPlayIcon className="w-5 h-5 text-primary" />
                )}
                {!data?.options.crossPlay && (
                  <>
                    {data?.options.platform?.toLowerCase() === "pc" && (
                      <PCIcon className="w-5 h-5 border-white/10" />
                    )}
                  </>
                )}

                <span className="leading-[normal] text-sm font-medium">
                  {data?.options.platform}
                </span>
              </span>

              <span className="flex gap-1.5 p-1.5 border border-white/10 rounded-lg items-center">
                {data?.options.mic ? (
                  <MicOnIcon className="w-5 h-5 text-success-2" />
                ) : (
                  <MicOffIcon className="w-5 h-5 text-danger" />
                )}
              </span>

              <span className="flex gap-1.5 p-1.5 border border-white/15 rounded-lg text-[#FACC15] items-center">
                <RankingIcon className="w-5 h-5 " />
              </span>
            </div>
          </div>
        </section>
        <section className="px-4 flex flex-col gap-4">
          {items.map(({ icon: Icon, ...item }) => (
            <div key={item.key} className="flex items-center gap-4">
              <span className="flex items-center justify-center bg-white/5 w-9 h-9 rounded-md">
                <Icon className="w-6 h-6 text-white/40" />
              </span>
              <div className="flex flex-col">
                <span className="text-white/30 font-normal">{item.label}</span>
                <span className="text-white/80 font-medium">{item.value}</span>
              </div>
            </div>
          ))}
        </section>

        {/* image carousel */}
        <section className="px-4">
          <div className="w-full h-60 rounded-lg overflow-hidden">
            <Image
              src="/images/games/battlefield.png"
              alt="battlefield"
              width={512}
              height={512}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </section>

        <section className="sticky mt-auto bg-background/90 backdrop-blur-[2px] bottom-0 left-0 border-t border-dashed border-white/10">
          <div className="flex flex-col bg-black/20">
            <div className="flex items-center justify-between gap-4 py-3 px-8">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md overflow-hidden">
                  <Image
                    src={data?.game.imageUrl || ""}
                    alt={data?.game.name || ""}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className="text-sm text-white/80 font-normal">
                  {data?.game.name}
                </span>
              </span>

              <span className="text-white/30 text-xs font-normal">
                32 minutes ago
              </span>
            </div>
            <LFGFooter />
          </div>
        </section>
      </div>
    </section>
  );
};

export default LFGDetail;
