/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/base/Modal";
import Select from "../../Select";
import { MonthDays, MonthNames } from "@/helpers/date";

type Props = {
  isOpen: boolean;
  value?: string;
  onChangeValue: (value: string) => void;
  onClose: () => void;
};

const years = Array.from(new Array(100)).map((_, i) => ({
  value: `${2025 - i}`,
  label: `${2025 - i}`,
}));

const months = MonthNames.map((month, index) => ({
  value: `${index + 1}`,
  label: month,
}));

const BirthDatePickerModal: React.FC<Props> = ({
  isOpen,
  value,
  onChangeValue,
  onClose,
}) => {
  const [yearValue, setYearValue] = useState<string>("");
  const [monthValue, setMonthValue] = useState<string>("");
  const [dayValue, setDayValue] = useState<string>("");

  useEffect(() => {
    if (!!value) {
      const [y, m, d] = value.split(".");
      if (y) setYearValue(y);
      if (m) setMonthValue(m);
      if (d) setDayValue(d);
    }
  }, [value]);

  useEffect(() => {
    if (monthValue) {
      const dayLength = MonthDays[+monthValue - 1];
      setDayValue((prev) => (+prev > dayLength ? "" : prev));
    }
  }, [monthValue]);

  const days = useMemo(() => {
    if (monthValue) {
      return Array.from(new Array(MonthDays[+monthValue - 1])).map((_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`,
      }));
    } else {
      return Array.from(new Array(31)).map((_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`,
      }));
    }
  }, [monthValue]);

  const handleDone = useCallback(() => {
    if (dayValue && monthValue && yearValue) {
      onChangeValue(`${yearValue}.${monthValue}.${dayValue}`);
    }
  }, [dayValue, monthValue, yearValue, onChangeValue]);

  return (
    <Modal
      title="Select date"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDone}
    >
      <div className="flex h-32 items-center gap-2">
        <Select
          label="Year"
          options={years}
          value={yearValue}
          onChangeValue={setYearValue}
        />
        <Select
          label="Month"
          options={months}
          value={monthValue}
          onChangeValue={setMonthValue}
        />
        <Select
          label="Day"
          options={days}
          value={dayValue}
          onChangeValue={setDayValue}
        />
      </div>
    </Modal>
  );
};

export default BirthDatePickerModal;
