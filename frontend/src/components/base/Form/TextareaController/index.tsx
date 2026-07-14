import React from "react";
import {
  Controller,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import Textarea, { TextareaProps } from "../Textarea";

export interface TextareaControllerProps extends TextareaProps {
  name: string;
  // control: Control<FieldValues, any, FieldValues>;
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
}

const TextareaController: React.FunctionComponent<TextareaControllerProps> = ({
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
        <Textarea
          {...props}
          onBlur={onBlur}
          onChangeText={(val) => {
            onChange(val);
            if (props?.onChangeText) props.onChangeText(val);
          }}
          errorMessage={invalid ? (error as any).message : props.errorMessage}
          isInvalid={invalid || props.isInvalid}
          value={value}
        />
      )}
    />
  );
};

export default TextareaController;
