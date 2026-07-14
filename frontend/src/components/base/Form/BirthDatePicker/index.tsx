import React, { useCallback, useState } from "react";
import BirthDatePickerInput, {
  BirthDatePickerInputProps,
} from "./BirthDatePickerInput";
import BirthDatePickerModal from "./BirthDatePickerModal";

export type BirthDatePickerProps = BirthDatePickerInputProps & {
  onChangeValue?: (value: string) => void;
};

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  onChangeValue,
  value,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleChange = useCallback(
    (val: string) => {
      if (onChangeValue) onChangeValue(val);
      setIsOpen(false);
    },
    [onChangeValue]
  );

  return (
    <>
      <BirthDatePickerInput value={value} onClick={handleToggle} {...props} />
      <BirthDatePickerModal
        isOpen={isOpen}
        onChangeValue={handleChange}
        onClose={handleToggle}
      />
    </>
  );
};

export default BirthDatePicker;
