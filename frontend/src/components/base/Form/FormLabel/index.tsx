import { ModeColor } from "@/@types/general.type";
import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export type FormLabelProps = {
  label?: string | React.ReactNode;
  isFocused?: boolean;
  htmlFor?: string;
  className?: string;
  focusedClassName?: string;
  isDisabled?: boolean;
  modeColor?: ModeColor;
  size?: "sm" | "md" | "lg" | undefined;
};

const FormLabel: React.FC<FormLabelProps> = ({
  label,
  htmlFor,
  focusedClassName,
  className,
  isDisabled,
  isFocused,
  modeColor = "dark",
  size,
}) => {
  return label ? (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        clsx(
          "text-[14px] block text-gray-500 peer-placeholder-shown:top-3 absolute left-4 z-10  px-0.5 pointer-events-none transition-all duration-200 peer-placeholder-shown:text-base",
          {
            "bg-background": modeColor === "dark",
            "-top-2 text-sm": isFocused,
            "top-3.5 text-base": !isFocused && size !== "lg",
            "top-4 text-base": !isFocused && size === "lg",
            "text-gray-800": isDisabled,
            [focusedClassName as string]: !!focusedClassName && isFocused,
          },
          className
        )
      )}
    >
      {label}
    </label>
  ) : null;
};

export default FormLabel;
