"use client";
import React from "react";
import {
  type ButtonProps as HButtonProps,
  Button as HButton,
} from "@heroui/react";
import { twMerge } from "tailwind-merge";

export type ButtonProps = HButtonProps;

const Button: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <HButton className={twMerge("h-11 font-bold", className)} {...props} />
  );
};

export default Button;
