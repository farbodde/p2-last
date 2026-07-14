"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";
import EarlySupportBadge from "@/components/common/Badge/EarlySupportBadge";
import Alert from "@/components/common/Alert";
import { getApiErrorList } from "@/helpers/api-error";
import { usePublicProfileQuery } from "@/hooks/queries/usePublicProfileQuery";
import ProfileBio from "../ProfileBio";
import ProfileLFGs from "../ProfileLFGs";

type Props = {
  username: string;
};

const formatGender = (gender?: string) => {
  if (!gender) {
    return "";
  }

  if (gender === "male") {
    return "Male";
  }

  if (gender === "female") {
    return "Female";
  }

  return "Prefer not to say";
};

const ProfileInfo: React.FC<Props> = ({ username }) => {
  const { data: profile, error, isLoading } = usePublicProfileQuery(username);
  const errorMessage = error
    ? getApiErrorList(
        error,
        "Failed to load profile information. Please try again.",
      )[0]
    : "";
  const details = [
    profile?.username ? `@${profile.username}` : null,
    formatGender(profile?.gender),
    profile?.languages.length
      ? profile.languages.map((language) => language.toUpperCase()).join(", ")
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <section className="relative h-[40vh]">
        <div className="absolute top-0 left-0 w-full h-full">
          <Image
            src={
              profile?.coverImage
                ? profile?.coverImage?.startsWith("http")
                  ? profile.coverImage
                  : `${process.env.NEXT_PUBLIC_BASE_URL}${profile?.coverImage}`
                : ""
            }
            alt={profile?.displayName ?? `${username}'s profile cover`}
            loading="eager"
            width={512}
            height={512}
            className="w-full h-full object-cover object-center mask-[linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0))]"
          />
        </div>
        <div className="flex items-center gap-4 absolute -mb-4 bottom-0 z-10 px-4">
          <div
            className={clsx("w-28 h-28 rounded-full border-4 overflow-hidden", {
              "border-emerald-700": profile?.isOnline,
              "border-transparent": !profile?.isOnline,
            })}
          >
            <Image
              src={profile?.profileImage ?? ""}
              alt={profile?.displayName ?? username}
              width={128}
              height={128}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <section className="flex items-start flex-col gap-1.5 mb-2">
            <EarlySupportBadge />

            <h1 className="text-3xl font-semibold">
              {isLoading
                ? "Loading profile..."
                : (profile?.displayName ?? username)}
            </h1>

            <div className="text-white/70">{details}</div>
          </section>
        </div>
      </section>
      <section className="flex flex-col gap-4 px-4">
        {errorMessage ? (
          <Alert
            type="error"
            title="Unable to load profile"
            message={errorMessage}
            dismissible={false}
          />
        ) : null}
        <ProfileBio location={profile?.location} aboutMe={profile?.aboutMe} />
        <ProfileLFGs username={username} />
      </section>
    </div>
  );
};

export default ProfileInfo;
