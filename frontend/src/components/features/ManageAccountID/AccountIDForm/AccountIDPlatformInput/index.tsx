import React, { useState } from "react";
import Button from "@/components/base/Button";
import AccountIDPlatform from "../AccountIDPlatform";
import { AccountIDItemType } from "@/@types/accountID.type";
import FormHelper, { FormHelperProps } from "@/components/base/Form/FormHelper";
import { ChevronDownIcon } from "@/components/common/icons";
import Image from "next/image";

export type AccountIDPlatformInputProps = FormHelperProps & {
  label?: string;
  onChange?: (val: AccountIDItemType) => void;
  value?: AccountIDItemType | null;
  classes?: {
    helper?: string;
  };
};

const AccountIDPlatformInput: React.FC<AccountIDPlatformInputProps> = ({
  label,
  value,
  classes,
  onChange,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (val: AccountIDItemType) => {
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex flex-col">
        <Button
          variant="bordered"
          className="h-14 border-white/20 p-3 rounded-lg border justify-between"
          onPress={() => setIsOpen(true)}
        >
          {value ? (
            <span className="flex items-center gap-2 text-white">
              {typeof value.icon === "string" ? (
                <Image
                  src={value.icon as string}
                  alt={value.label}
                  width={40}
                  height={40}
                  unoptimized={
                    value.icon.startsWith("http://") ||
                    value.icon.startsWith("https://")
                  }
                  className="h-7.5 w-7.5 object-contain"
                />
              ) : (
                value.icon
              )}
              <span className="text-white">{value.label}</span>
            </span>
          ) : (
            <span className="text-gray-500 text-base">
              {label || "Select Platform"}
            </span>
          )}
          <ChevronDownIcon className="w-5 h-5 text-white" />
        </Button>
        <FormHelper {...props} className={classes?.helper} />
      </div>
      <AccountIDPlatform
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDone={handleSelect}
      />
    </>
  );
};

export default AccountIDPlatformInput;
