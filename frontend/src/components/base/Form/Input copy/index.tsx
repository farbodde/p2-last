import React, {
  forwardRef,
  useCallback,
  useState,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { twMerge } from "tailwind-merge";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupInput,
// } from '@/components/ui/input-group';
import FormLabel from "../FormLabel";
import FormHelper from "../FormHelper";
import clsx from "clsx";
// import { Eye, EyeClosed } from '@solar-icons/react';

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
      ...props
    },
    ref
  ) => {
    const [type, setType] = useState(initialType);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> =
      useCallback(
        (e) => {
          if (props.onChange) props.onChange(e);
          if (onChangeText) onChangeText(e.target.value);
        },
        [onChangeText, props]
      );

    const handleToggleType = useCallback(() => {
      setType((prev) => (prev === "password" ? "text" : "password"));
    }, []);

    return (
      <div className={twMerge(clsx("w-full gap-1", classes?.container))}>
        <FormLabel
          htmlFor={props?.id}
          label={label}
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
          {initialType === "search" ? (
            <div onClick={startIconClick} className="p-2">
              <span className="text-sm border text-red-700 border-red-700">
                Srch
              </span>
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
            ref={ref}
            type={type}
            className={twMerge(
              clsx(
                "flex-1 w-full p-2 focus:outline-0 font-IRANSans-medium text-base",
                className
              )
            )}
            onChange={handleChange}
          />

          {initialType === "password" ? (
            <div onClick={handleToggleType} className="p-2">
              <span className="text-sm border text-red-700 border-red-700">
                {type === "password" ? "EyeClosed" : "Eye"}
              </span>
            </div>
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
  }
);

export default Input;

// const Input = forwardRef<HTMLInputElement, InputProps>(
//   (
//     {
//       label,
//       helperText,
//       errorMessage,
//       isInvalid,
//       startIcon,
//       endIcon,
//       endIconClick,
//       isDisabled,
//       classes,
//       className,
//       isRequired,
//       type: initialType,
//       onChangeText,
//       ...props
//     },
//     ref
//   ) => {
//     const [type, setType] = useState(initialType);
//     const handleChange: React.ChangeEventHandler<HTMLInputElement> =
//       useCallback(
//         (e) => {
//           if (props.onChange) props.onChange(e);
//           if (onChangeText) onChangeText(e.target.value);
//         },
//         [onChangeText, props]
//       );

//     const handleToggleType = useCallback(() => {
//       setType((prev) => (prev === 'password' ? 'text' : 'password'));
//     }, []);

//     return (
//       <div className={twMerge(classNames('w-full gap-1', classes?.container))}>
//         <FormLabel
//           htmlFor={props?.id}
//           label={label}
//           isRequired={isRequired}
//           isDisabled={isDisabled}
//           isInvalid={isInvalid}
//           className={classes?.label}
//         />
//         <InputGroup
//           className={classNames(
//             {
//               'border-error-600': isInvalid,
//             },
//             classes?.wrapper
//           )}>
//           {startIcon && (
//             <InputGroupAddon align="inline-start" className="rtl:pl-0 rtl:pr-3">
//               {startIcon}
//             </InputGroupAddon>
//           )}

//           <InputGroupInput
//             className={twMerge(
//               classNames(
//                 'flex-1 rtl text-right w-full px-4 font-IRANSans-medium text-base',
//                 className
//               )
//             )}
//             ref={ref}
//             onChange={handleChange}
//             type={type}
//             {...props}
//           />

//           {initialType === 'password' ? (
//             <InputGroupAddon
//               align="inline-end"
//               className="rtl:pr-0 rtl:pl-3 cursor-pointer"
//               onClick={handleToggleType}>
//               {type === 'password' ? <EyeClosed /> : <Eye />}
//             </InputGroupAddon>
//           ) : (
//             endIcon && (
//               <InputGroupAddon
//                 align="inline-end"
//                 className="rtl:pr-0 rtl:pl-3"
//                 onClick={endIconClick}>
//                 {endIcon}
//               </InputGroupAddon>
//             )
//           )}
//         </InputGroup>

//         <FormHelper
//           isInvalid={isInvalid}
//           isDisabled={isDisabled}
//           errorMessage={errorMessage}
//           helperText={helperText}
//           className={classes?.helper}
//         />
//       </div>
//     );
//   }
// );

// export default Input;
