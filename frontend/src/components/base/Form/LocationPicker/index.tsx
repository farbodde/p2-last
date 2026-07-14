import React, { useCallback, useMemo, useState } from "react";
import LocationPickerInput, {
  LocationPickerInputProps,
} from "./LocationPickerInput";
import LocationPickerModal from "./LocationPickerModal";

export type LocationPickerProps = Omit<LocationPickerInputProps, "value"> & {
  onChangeValue?: (value: string) => void;
  value?: string;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
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
    [onChangeValue],
  );

  const inputValue = useMemo(() => value || "", [value]);

  return (
    <>
      <LocationPickerInput
        value={inputValue}
        onClick={handleToggle}
        {...props}
      />
      <LocationPickerModal
        isOpen={isOpen}
        value={value}
        onChangeValue={handleChange}
        onClose={handleToggle}
      />
    </>
  );
};

export default LocationPicker;
