"use client";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeftIcon, SettingIcon } from "@/components/common/icons";

const ProfileHeader = () => {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const id = params?.id;

  const handleBack = () => {
    router.back();
  };

  if (pathname === "/profile" || id === "1") {
    return (
      <Link
        href="/profile/edit"
        className="h-11 w-11 flex items-center justify-center fixed right-4 screen:right-[calc((50%-var(--container-xl)/2)+16px)] top-4 bg-black/20 p-2 rounded-lg z-20 transition hover:bg-black/30"
      >
        <SettingIcon className="w-6 h-6" />
      </Link>
    );
  }

  return (
    <div
      className="h-8 flex items-center justify-center fixed left-4 screen:left-[calc((50%-var(--container-xl)/2)+16px)] top-4 bg-black/20 py-2 px-1 rounded-lg z-20 hover:bg-black/30 transition cursor-pointer"
      onClick={handleBack}
    >
      <ArrowLeftIcon className="w-6 h-6" />
    </div>
  );
};

export default ProfileHeader;
