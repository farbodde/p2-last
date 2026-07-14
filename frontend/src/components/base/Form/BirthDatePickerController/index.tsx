import React from "react";
import {
  Controller,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import BirthDatePicker, { BirthDatePickerProps } from "../BirthDatePicker";

export interface BirthDatePickerControllerProps extends BirthDatePickerProps {
  name: string;
  // control: Control<FieldValues, any, FieldValues>;
  defaultValue?: string;
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
}

const BirthDatePickerController: React.FunctionComponent<
  BirthDatePickerControllerProps
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
        <BirthDatePicker
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

export default BirthDatePickerController;
