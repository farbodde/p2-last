import React from "react";
import {
  Controller,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import LanguagePicker, { LanguagePickerProps } from "../LanguagePicker";

export interface LanguagePickerControllerProps extends LanguagePickerProps {
  name: string;
  // control: Control<FieldValues, any, FieldValues>;
  defaultValue?: string[];
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
}

const LanguagePickerController: React.FunctionComponent<
  LanguagePickerControllerProps
> = ({ name, control, rules, defaultValue, ...props }) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field: { onChange, value },
        fieldState: { invalid, error },
      }) => (
        <LanguagePicker
          {...props}
          onChangeValue={(val) => {
            onChange(val);
            if (props?.onChangeValue) props.onChangeValue(val);
          }}
          errorMessage={invalid ? (error as any).message : props.errorMessage}
          isInvalid={invalid || props.isInvalid}
          value={value}
        />
      )}
    />
  );
};

export default LanguagePickerController;
