import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { GameFilterItemType } from "@/@types/game.type";

type Props = {
  item: GameFilterItemType;
  isActive?: boolean;
};

const HomeGameFilterItem = ({ item, isActive = false }: Props) => {
  const isRemoteImage =
    typeof item.imageUrl === "string" &&
    (item.imageUrl.startsWith("http://") || item.imageUrl.startsWith("https://"));

  return (
    <Link
      href={{
        pathname: "/",
        query: {
          game: item.key,
        },
      }}
      className={clsx(
        "flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 transition",
        {
          "border-[#3E8BFF]": isActive,
          "border-transparent": !isActive,
        },
      )}
      aria-current={isActive ? "page" : undefined}
      aria-label={`Filter by ${item.title}`}
      title={item.title}
    >
      {item.imageUrl ? (
        <Image
          width={64}
          height={64}
          src={item.imageUrl}
          alt={item.title}
          unoptimized={isRemoteImage}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-white/10 px-2 text-center text-xs font-medium text-white">
          {item.title}
        </span>
      )}
    </Link>
  );
};

export default HomeGameFilterItem;
