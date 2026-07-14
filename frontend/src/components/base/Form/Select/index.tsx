import React, { ChangeEventHandler, useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import FormLabel from "../FormLabel";
import FormHelper from "../FormHelper";
import clsx from "clsx";
import {
  Select as HSelect,
  SelectItem,
  SharedSelection,
  type SelectProps as HSelectProps,
} from "@heroui/react";
import { ModeColor } from "@/@types/general.type";

export type SelectOptionItem = {
  value: string;
  label: string;
};

export type SelectProps = Omit<HSelectProps, "children"> & {
  label?: string | React.ReactNode;
  modeColor?: ModeColor;
  helperText?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startIconClick?: () => void;
  endIconClick?: () => void;
  isDisabled?: boolean;
  onChangeValue?: (value: string) => void;
  classes?: {
    container?: string;
    wrapper?: string;
    label?: string;
    helper?: string;
  };
  options: SelectOptionItem[];
};

// eslint-disable-next-line react/display-name
const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  errorMessage,
  isInvalid,
  startIcon,
  endIcon,
  startIconClick,
  endIconClick,
  isDisabled,
  classes,
  modeColor = "dark",

  onChangeValue,
  value,
  options,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (items: SharedSelection) => {
      const value = [...items] as string[];

      if (onChangeValue) {
        onChangeValue(value?.[0] || "");
      }
    },
    [onChangeValue]
  );

  return (
    <div className={twMerge(clsx("w-full relative gap-1", classes?.container))}>
      <FormLabel
        modeColor={modeColor}
        size={props.size}
        htmlFor={props?.id}
        label={label}
        isFocused={isFocused || !!value}
        isDisabled={isDisabled}
        className={classes?.label}
      />

      <div
        className={clsx(
          "flex items-center border border-white/20 rounded-lg",
          {
            "border-error-600": isInvalid,
          },
          classes?.wrapper
        )}
      >
        {startIcon && (
          <div onClick={startIconClick}>
            <span className="text-sm border text-red-700 border-red-700">
              IC
            </span>
          </div>
        )}

        <HSelect
          size="lg"
          onSelectionChange={handleChange}
          onOpenChange={setIsFocused}
          value={value}
          {...props}
          classNames={{
            value: clsx("font-medium text-base", {
              "text-black!": modeColor === "light",
              "text-white!": modeColor === "dark",
            }),
            popoverContent: "bg-tab!",
            trigger: modeColor === "dark" ? "bg-background!" : "bg-slate-100",
            ...props.classNames,
          }}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              classNames={{ base: modeColor === "dark" ? "bg-tab!" : "" }}
              textValue={opt.label}
            >
              <span
                className={clsx("font-medium text-base", {
                  "text-black!": modeColor === "light",
                  "text-white!": modeColor === "dark",
                })}
              >
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </HSelect>

        {endIcon && (
          <div onClick={endIconClick} className="p-2">
            <span className="text-sm border text-red-700 border-red-700">
              IC
            </span>
          </div>
        )}
      </div>

      <FormHelper
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        errorMessage={errorMessage}
        helperText={helperText}
        className={classes?.helper}
      />
    </div>
  );
};

export default Select;
