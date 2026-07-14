import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export type FormLabelProps = {
  label?: string | React.ReactNode;
  htmlFor?: string;
  className?: string;
  isDisabled?: boolean;
};

const FormLabel: React.FC<FormLabelProps> = ({
  label,
  htmlFor,
  className,
  isDisabled,
}) => {
  return label ? (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        clsx(
          "text-[14px] mb-1 block",
          {
            "text-gray-800": isDisabled,
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
