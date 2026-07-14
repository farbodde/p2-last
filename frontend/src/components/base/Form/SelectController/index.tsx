import React from "react";
import {
  Controller,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import Select, { type SelectProps } from "../Select";

export interface SelectControllerProps extends SelectProps {
  name: string;
  // control: Control<FieldValues, any, FieldValues>;
  defaultValue?: string;
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
}

const SelectController: React.FunctionComponent<SelectControllerProps> = ({
  name,
  control,
  rules,
  defaultValue,
  ...props
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { invalid, error },
      }) => (
        <Select
          {...props}
          onBlur={onBlur}
          onChangeValue={(val) => {
            onChange(val);
            if (props?.onChangeValue) props.onChangeValue(val);
          }}
          defaultSelectedKeys={defaultValue ? [defaultValue] : undefined}
          errorMessage={invalid ? (error as any).message : props.errorMessage}
          isInvalid={invalid || props.isInvalid}
          value={value}
        />
      )}
    />
  );
};

export default SelectController;
