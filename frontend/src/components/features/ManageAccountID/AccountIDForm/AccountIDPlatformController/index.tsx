import React from "react";
import { Controller, FieldValues, RegisterOptions } from "react-hook-form";
import AccountIDPlatformInput, {
  AccountIDPlatformInputProps,
} from "../AccountIDPlatformInput";
import { AccountIDItemType } from "@/@types/accountID.type";

export type AccountIDPlatformControllerProps = AccountIDPlatformInputProps & {
  name: string;
  // control: Control<FieldValues, any, FieldValues>;
  defaultValue?: AccountIDItemType | null;
  control: any;
  rules?: RegisterOptions<FieldValues, string>;
};

const AccountIDPlatformController: React.FC<
  AccountIDPlatformControllerProps
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
        <AccountIDPlatformInput
          {...props}
          onChange={onChange}
          errorMessage={invalid ? (error as any).message : props.errorMessage}
          isInvalid={invalid}
          value={value}
        />
      )}
    />
  );
};

export default AccountIDPlatformController;
