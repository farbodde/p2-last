import React, {
  forwardRef,
  useCallback,
  type TextareaHTMLAttributes,
  type Ref,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import FormLabel from "../FormLabel";
import FormHelper from "../FormHelper";
import clsx from "clsx";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string | React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startIconClick?: () => void;
  endIconClick?: () => void;
  isDisabled?: boolean;
  onChangeText?: (value: string) => void;
  classes?: {
    container?: string;
    wrapper?: string;
    input?: string;
    label?: string;
    helper?: string;
  };
  ref?: Ref<HTMLTextAreaElement>;
};

// eslint-disable-next-line react/display-name
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
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
      className,
      onChangeText,
      value,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> =
      useCallback(
        (e) => {
          if (props.onChange) props.onChange(e);
          if (onChangeText) onChangeText(e.target.value);
        },
        [onChangeText, props],
      );

    return (
      <div
        className={twMerge(clsx("w-full relative gap-1", classes?.container))}
      >
        <FormLabel
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
            classes?.wrapper,
          )}
        >
          {startIcon && (
            <div onClick={startIconClick}>
              <span className="text-sm border text-red-700 border-red-700">
                IC
              </span>
            </div>
          )}
          <textarea
            {...props}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={twMerge(
              clsx(
                "peer flex-1 w-full p-3.5 focus:outline-0 font-IRANSans-medium text-base",
                className,
              ),
            )}
            onChange={handleChange}
            value={value}
          />

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
  },
);

export default Textarea;
