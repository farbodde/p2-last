import React, { useCallback, useMemo, useState } from "react";
import LanguagePickerInput, {
  LanguagePickerInputProps,
} from "./LanguagePickerInput";
import LanguagePickerModal from "./LanguagePickerModal";
import { languagesMock } from "@/mocks/language.mock";
// import LanguagePickerModal from "./LanguagePickerModal";

export type LanguagePickerProps = Omit<LanguagePickerInputProps, "value"> & {
  onChangeValue?: (value: string[]) => void;
  value?: string[];
};

const LanguagePicker: React.FC<LanguagePickerProps> = ({
  onChangeValue,
  value,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleChange = useCallback(
    (val: string[]) => {
      if (onChangeValue) onChangeValue(val);
      setIsOpen(false);
    },
    [onChangeValue]
  );

  const inputValue = useMemo(
    () =>
      languagesMock
        .filter((i) => (value || []).includes(i.value))
        .map((i) => i.label)
        .join(", "),
    [value]
  );

  return (
    <>
      <LanguagePickerInput
        value={inputValue}
        onClick={handleToggle}
        {...props}
      />
      <LanguagePickerModal
        isOpen={isOpen}
        value={value}
        onChangeValue={handleChange}
        onClose={handleToggle}
      />
    </>
  );
};

export default LanguagePicker;
