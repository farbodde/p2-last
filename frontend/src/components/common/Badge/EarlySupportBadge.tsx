import React from "react";
import { LogoIcon } from "../icons";

const EarlySupportBadge = () => {
  return (
    <div
      dir="ltr"
      className="flex items-center gap-1.5 rounded-full w-fit bg-primary px-2 py-0.5"
    >
      <LogoIcon className="w-3.5 h-3.5" />
      <span className="text-[10px] text-white/80">Early Supporter</span>
    </div>
  );
};

export default EarlySupportBadge;
