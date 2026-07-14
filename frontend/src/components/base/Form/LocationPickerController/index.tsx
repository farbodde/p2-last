import React from "react";
import {
  Controller,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import LocationPicker, { LocationPickerProps } from "../LocationPicker";

export interface LocationPickerControllerProps extends LocationPickerProps {
  name: string;
  // control: Control<FieldValues, any, FieldValues>;
  defaultValue?: string[];
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
}

const LocationPickerController: React.FunctionComponent<
  LocationPickerControllerProps
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
        <LocationPicker
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

export default LocationPickerController;
