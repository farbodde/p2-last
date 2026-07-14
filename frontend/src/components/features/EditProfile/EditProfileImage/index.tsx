/* eslint-disable @next/next/no-img-element */
import Button from "@/components/base/Button";
import { EditOutlineIcon } from "@/components/common/icons";
import Image from "next/image";
import React from "react";

type Props = {
  profileImage?: string | null;
  coverImage?: string | null;
  isDisabled?: boolean;
  onProfileImageChange?: (file: File | null) => void;
  onCoverImageChange?: (file: File | null) => void;
};

const EditProfileImage = ({
  profileImage,
  coverImage,
  isDisabled = false,
  onProfileImageChange,
  onCoverImageChange,
}: Props) => {
  return (
    <section className="flex gap-4 justify-between items-start">
      <label
        htmlFor="avatarFile"
        className="flex-1 flex items-center justify-center"
      >
        <input
          type="file"
          name="avatarFile"
          id="avatarFile"
          className="hidden"
          accept="image/*"
          disabled={isDisabled}
          onChange={(event) =>
            onProfileImageChange?.(event.target.files?.[0] ?? null)
          }
        />
        <span className="flex flex-col items-center gap-3 max-w-full w-28">
          <span className="block w-full relative">
            <span className="block w-full h-full rounded-full overflow-hidden">
              <Image
                src={profileImage ?? ""}
                width={128}
                height={128}
                alt="User"
                className="w-full h-full object-cover"
              />
            </span>
            <span className="absolute -bottom-0.5 -right-1 w-8 h-8 flex items-center justify-center rounded-full bg-tab text-sm">
              <EditOutlineIcon className="w-4 h-4" />
            </span>
          </span>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            as="span"
            className="w-full font-semibold text-primary text-sm bg-white/5"
          >
            {isDisabled ? "Loading..." : "Profile Picture"}
          </Button>
        </span>
      </label>

      <label
        htmlFor="backgroundFile"
        className="flex-1 flex items-center justify-center"
      >
        <input
          type="file"
          name="backgroundFile"
          id="backgroundFile"
          className="hidden"
          accept="image/*"
          disabled={isDisabled}
          onChange={(event) =>
            onCoverImageChange?.(event.target.files?.[0] ?? null)
          }
        />
        <span className="flex flex-col items-center gap-3 max-w-full w-28">
          <span className="block aspect-square relative">
            <span className="block w-full h-full rounded-xl overflow-hidden">
              <img
                src={coverImage ?? "/images/games/battlefield.png"}
                alt="User"
                className="w-full h-full object-cover"
              />
            </span>
            <span className="absolute -bottom-0.5 -right-4 w-8 h-8 flex items-center justify-center rounded-full bg-tab text-sm">
              <EditOutlineIcon className="w-4 h-4" />
            </span>
          </span>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            as="span"
            className="w-full font-semibold text-primary text-sm bg-white/5"
          >
            {isDisabled ? "Loading..." : "Cover Picture"}
          </Button>
        </span>
      </label>
    </section>
  );
};

export default EditProfileImage;
