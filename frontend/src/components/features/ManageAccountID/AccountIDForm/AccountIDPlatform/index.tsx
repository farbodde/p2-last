import { useEffect, useState } from "react";
import clsx from "clsx";
import Header from "@/components/layouts/Header";
import Button from "@/components/base/Button";
import type { AccountIDItemType } from "@/@types/accountID.type";
import { GameIcon } from "@/components/common/icons";
import Image from "next/image";
import { useFilterConfigQuery } from "@/hooks/queries/useFilterConfigQuery";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onDone: (platform: AccountIDItemType) => void;
};

const AccountIDPlatform: React.FC<Props> = ({ isOpen, onClose, onDone }) => {
  const [show, setShow] = useState<boolean>(false);
  const {
    data,
    error,
    isError,
    isLoading,
    isRefetching,
    refetch,
  } = useFilterConfigQuery({ enabled: isOpen });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isOpen) {
      timeout = setTimeout(() => {
        setShow(isOpen);
      });
    } else {
      timeout = setTimeout(() => {
        setShow(isOpen);
      }, 150);
    }

    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <section
      className={clsx(
        "fixed top-0 width-screen bg-background z-50 flex flex-col overflow-auto scroll-smooth gap-4 left-1/2 h-full delay-75 transition -translate-x-1/2",
        {
          "opacity-100 translate-y-0": show,
          "translate-y-1/2 opacity-0": !show || !isOpen,
        },
      )}
    >
      <Header title="Select a Platform" onClose={onClose} />
      <div className="flex flex-col gap-3 p-4 pb-10">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-white/5"
              />
            ))
          : null}

        {isError ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-danger/30 bg-danger/10 p-4 text-center">
            <span className="text-sm text-danger">
              {error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Failed to load platforms. Please try again."}
            </span>
            <Button
              color="danger"
              variant="bordered"
              isLoading={isRefetching}
              onPress={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && data?.platforms.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
            No platforms are available.
          </div>
        ) : null}

        {data?.platforms.map((platform) => (
          <Button
            key={platform.id}
            fullWidth
            variant="bordered"
            className="h-fit border-white/20 justify-start p-3 border-1.5"
            onPress={() =>
              onDone({
                id: platform.id,
                key: String(platform.id),
                label: platform.title,
                icon: platform.logo || (
                  <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-white text-sm text-black">
                    <GameIcon className="h-5 w-5" />
                  </span>
                ),
              })
            }
          >
            {platform.logo ? (
              <Image
                src={platform.logo}
                alt={platform.title}
                width={40}
                height={40}
                unoptimized={
                  platform.logo.startsWith("http://") ||
                  platform.logo.startsWith("https://")
                }
                className="h-7.5 w-7.5 object-contain"
              />
            ) : (
              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-white text-sm text-black">
                <GameIcon className="h-5 w-5" />
              </span>
            )}
            <span className="font-semibold text-white">{platform.title}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};

export default AccountIDPlatform;
