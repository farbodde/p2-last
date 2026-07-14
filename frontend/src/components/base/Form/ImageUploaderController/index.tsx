import React from "react";
import { Controller, FieldValues, RegisterOptions } from "react-hook-form";
import ImageUploader, { ImageUploaderProps } from "../ImageUploader";

export interface ImageUploaderControllerProps extends ImageUploaderProps {
  name: string;
  defaultValue?: string;
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
}

const ImageUploaderController: React.FC<ImageUploaderControllerProps> = ({
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
        field: { onChange, value },
        // fieldState: { invalid, error },
      }) => (
        <ImageUploader
          {...props}
          onChange={(val) => {
            onChange(val);
            if (props?.onChange) props.onChange(val);
          }}
          // errorMessage={invalid ? (error as any).message : props.errorMessage}
          // isInvalid={invalid || props.isInvalid}
          value={value}
        />
      )}
    />
  );
};

export default ImageUploaderController;
