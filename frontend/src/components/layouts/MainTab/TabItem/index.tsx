"use client";
import React, { JSX } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  icon: JSX.Element;
};

const TabItem: React.FC<Props> = ({ icon, href }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-1 h-full flex-col gap-1 items-center  transition justify-center group",
        {
          "text-[#808080]": !href.includes("landing"),
          "text-[#3E8BFF]": href.includes("landing"),
          "text-white active": isActive,
        }
      )}
    >
      {icon}
      <span className="w-2 h-0.5 block rounded-full bg-transparent transition group-[.active]:bg-white" />
    </Link>
  );
};

export default TabItem;
