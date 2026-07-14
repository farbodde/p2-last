"use client";
import Image from "next/image";
import Link from "next/link";
import { AppName } from "@/constants/AppConstants";
import { useEffect, useState } from "react";
import clsx from "clsx";
import HeaderNotification from "./HeaderNotification";

const MainHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // run once on mount (in case page loads already scrolled)
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={clsx(
        "flex sticky top-0 left-0 w-full transition-colors duration-300 items-center justify-between gap-4 p-4",
        {
          "bg-background/80 backdrop-blur-[2px]": isScrolled,
          "bg-transparent": !isScrolled,
        },
      )}
    >
      <Link href="/">
        <Image
          src="/images/main-logo.svg"
          alt={AppName}
          className="w-32 object-contain"
          width={128}
          height={64}
        />
      </Link>
      <HeaderNotification />
    </header>
  );
};

export default MainHeader;
