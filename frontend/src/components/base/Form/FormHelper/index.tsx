import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export type FormHelperProps = {
  isDisabled?: boolean;
  isInvalid?: boolean;
  className?: string;
  errorMessage?: string;
  helperText?: string;
};

const FormHelper: React.FC<FormHelperProps> = ({
  errorMessage,
  helperText,
  isDisabled,
  isInvalid,
  className,
}) => {
  if (!(errorMessage || helperText)) return null;

  return (
    <span
      className={twMerge(
        clsx(
          "block py-1 text-[12px] text-gray-600",
          {
            "text-gray-600": isDisabled,
            "text-red-500/80": isInvalid,
          },
          className
        )
      )}
    >
      {errorMessage || helperText}
    </span>
  );
};

export default FormHelper;
