import React, {
  forwardRef,
  useCallback,
  useState,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { twMerge } from "tailwind-merge";
import FormLabel from "../FormLabel";
import FormHelper from "../FormHelper";
import clsx from "clsx";
import { EyeClosedIcon, EyeIcon, SearchIcon } from "@/components/common/icons";
import Button from "../../Button";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  isInvalid?: boolean;
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
    labelFocused?: string;
    helper?: string;
  };
  ref?: Ref<HTMLInputElement>;
};

// eslint-disable-next-line react/display-name
const Input = forwardRef<HTMLInputElement, InputProps>(
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
      type: initialType,
      onChangeText,
      value,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [type, setType] = useState(initialType);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> =
      useCallback(
        (e) => {
          if (props.onChange) props.onChange(e);
          if (onChangeText) onChangeText(e.target.value);
        },
        [onChangeText, props],
      );

    const handleToggleType = useCallback(() => {
      setType((prev) => (prev === "password" ? "text" : "password"));
    }, []);

    return (
      <div
        className={twMerge(clsx("w-full relative gap-1", classes?.container))}
      >
        <FormLabel
          htmlFor={props?.id || props?.name}
          label={label}
          isFocused={isFocused || !!value}
          isDisabled={isDisabled}
          className={classes?.label}
          focusedClassName={classes?.labelFocused}
        />

        <div
          className={clsx(
            "flex items-center border overflow-hidden border-white/20 rounded-lg",
            {
              "border-error-600": isInvalid,
            },
            classes?.wrapper,
          )}
        >
          {initialType === "search" ? (
            <div className="py-2 px-3">
              <SearchIcon className="w-5 h-5 text-white/60" />
            </div>
          ) : (
            startIcon && (
              <div onClick={startIconClick}>
                <span className="text-sm border text-red-700 border-red-700">
                  IC
                </span>
              </div>
            )
          )}
          <input
            {...props}
            id={props?.id || props?.name}
            ref={ref}
            type={type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=" "
            value={value}
            className={twMerge(
              clsx(
                "peer flex-1 w-full p-3.5 focus:outline-0 font-IRANSans-medium text-base",
                className,
              ),
            )}
            onChange={handleChange}
          />

          {initialType === "password" ? (
            <Button
              variant="light"
              onPress={handleToggleType}
              radius="full"
              size="sm"
              className="p-0 mr-2 min-w-0 aspect-square text-white/60 w-fit"
            >
              {type === "password" ? (
                <EyeClosedIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </Button>
          ) : (
            endIcon && (
              <div onClick={endIconClick} className="p-2">
                <span className="text-sm border text-red-700 border-red-700">
                  IC
                </span>
              </div>
            )
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

export default Input;
