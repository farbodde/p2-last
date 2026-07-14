"use client";
/* eslint-disable @next/next/no-img-element */
import { EditIcon } from "@/components/common/icons";
import Link from "next/link";
import { CircularProgress } from "@heroui/react";
import type { ProfileViewData } from "@/@types/profile.type";
import EarlySupportBadge from "@/components/common/Badge/EarlySupportBadge";
import ProfileBio from "../ProfileBio";
import Alert from "@/components/common/Alert";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import { getApiErrorList } from "@/helpers/api-error";
import ProfileLFGs from "../ProfileLFGs";
import Image from "next/image";

const formatGender = (gender: ProfileViewData["gender"]) => {
  if (gender === "male") {
    return "Male";
  }

  if (gender === "female") {
    return "Female";
  }

  return "Prefer not to say";
};

const getAge = (dateOfBirth: string | null) => {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const ProfileInfoOwner = () => {
  const { data: profile, error, isLoading } = useProfileQuery();

  const errorMessage = error
    ? getApiErrorList(
        error,
        "Failed to load profile information. Please try again.",
      )[0]
    : "";

  const age = getAge(profile?.dateOfBirth ?? null);
  const details = [
    age ? `${age} Years Old` : null,
    profile ? formatGender(profile.gender) : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-6">
      <section className="relative h-[40vh] mb-4">
        <div className="absolute top-0 left-0 w-full h-full ">
          <Image
            src={
              profile?.coverImage
                ? profile?.coverImage?.startsWith("http")
                  ? profile.coverImage
                  : `${process.env.NEXT_PUBLIC_BASE_URL}${profile?.coverImage}`
                : ""
            }
            alt={profile?.displayName ?? "Profile cover"}
            className="w-full h-full object-cover object-center mask-[linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0))]"
            width={512}
            height={512}
          />
        </div>
        <div className="flex items-center gap-4 absolute -mb-4 bottom-0 z-10 px-4">
          <Link
            href="/profile/edit"
            className="w-28 h-28 relative flex items-center justify-center"
          >
            <span className="absolute -top-1 -right-1 bg-[#252932] w-7.5 h-7.5 z-10 rounded-full flex items-center justify-center text-yellow-400">
              <EditIcon className="w-4.5 h-4.5" />
            </span>

            <CircularProgress
              formatOptions={{ style: "unit", unit: "kilometer" }}
              showValueLabel={true}
              size="lg"
              value={profile?.profileCompletion ?? 0}
              strokeWidth={1}
              classNames={{
                svg: "w-32 h-32 min-w-28 min-h-28 rotate-180 text-yellow-400",
              }}
              valueLabel={
                <span className="w-28 h-28 rounded-full overflow-hidden">
                  <Image
                    src={
                      profile?.profileImage ?? "/images/games/battlefield.png"
                    }
                    width={128}
                    height={128}
                    alt={profile?.displayName ?? "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                </span>
              }
            />
            <span className="absolute bottom-0 translate-y-1/2 leading-[normal] text-[10px] font-semibold bg-[#8058CB] px-3 h-5 flex items-center justify-center rounded-lg">
              {isLoading
                ? "Loading..."
                : `${Math.round(profile?.profileCompletion ?? 0)}% COMPLETE`}
            </span>
          </Link>

          <section className="flex items-start flex-col gap-1.5 mb-2">
            <EarlySupportBadge />

            <h1 className="text-3xl font-semibold">
              {isLoading
                ? "Loading profile..."
                : (profile?.displayName ?? "Player")}
            </h1>

            <div className="text-white/70">
              {details || profile?.email || ""}
            </div>
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
        <ProfileLFGs />
      </section>
    </div>
  );
};

export default ProfileInfoOwner;
