import React from "react";
import FormHelper from "../../FormHelper";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import FormLabel from "../../FormLabel";
import { ChevronRightIcon } from "@/components/common/icons";

export type LanguagePickerInputProps = {
  id?: string;
  label?: string | React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startIconClick?: () => void;
  endIconClick?: () => void;
  isDisabled?: boolean;
  className?: string;
  value?: string;

  onClick?: () => void;

  classes?: {
    container?: string;
    wrapper?: string;
    input?: string;
    label?: string;
    helper?: string;
  };
};

const LanguagePickerInput: React.FC<LanguagePickerInputProps> = ({
  label,
  id,
  helperText,
  errorMessage,
  isInvalid,
  startIcon,
  endIcon,
  startIconClick,
  endIconClick,
  isDisabled,
  classes,
  className,
  value,
  onClick,
}) => {
  return (
    <div
      className={twMerge(
        clsx("w-full relative gap-1 cursor-pointer", classes?.container),
      )}
      onClick={onClick}
    >
      <FormLabel
        htmlFor={id}
        label={label}
        isFocused={!!value}
        isDisabled={isDisabled}
        className={classes?.label}
      />

      <div
        className={clsx(
          "flex items-center border border-white/20 rounded-lg",
          {
            "border-error-600": isInvalid,
          },
          classes?.wrapper,
        )}
      >
        {startIcon && <div onClick={startIconClick}>{startIcon}</div>}

        <span
          className={twMerge(
            clsx("flex-1 w-full h-[3.1rem] p-3.5 flex items-center", className),
          )}
        >
          <span className="leading-[normal] line-clamp-1 mt-0.5 font-IRANSans-medium text-base">
            {value}
          </span>
        </span>

        {endIcon ? (
          <div onClick={endIconClick} className="p-2">
            {endIcon}
          </div>
        ) : (
          <div onClick={endIconClick} className="p-2">
            <ChevronRightIcon className="w-6 h-6 text-white/60" />
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

export default LanguagePickerInput;
