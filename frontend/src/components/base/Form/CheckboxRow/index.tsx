import React from "react";
import Checkbox, { CheckboxProps } from "../Checkbox";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type Props = {
  label: string | React.ReactNode;
  name: string;
  className?: string;
} & CheckboxProps;

const CheckboxRow: React.FC<Props> = ({
  label,
  name,
  className,
  ...restProps
}) => {
  return (
    <div className={twMerge(clsx("flex items-center px-4", className))}>
      <label htmlFor={name} className="block flex-1 py-1.5 text-sm">
        {label}
      </label>
      <Checkbox name={name} {...restProps} />
    </div>
  );
};

export default CheckboxRow;
