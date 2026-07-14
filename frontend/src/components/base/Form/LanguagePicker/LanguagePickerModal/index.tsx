import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import Header from "@/components/layouts/Header";
import Button from "@/components/base/Button";
import CheckboxRow from "../../CheckboxRow";
import { languagesMock } from "@/mocks/language.mock";

type Props = {
  value?: string[];
  isOpen: boolean;
  onClose: () => void;
  onChangeValue: (val: string[]) => void;
};

const LanguagePickerModal: React.FC<Props> = ({
  value: defaultvalue = [],
  isOpen,
  onClose,
  onChangeValue,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [value, setValue] = useState<string[]>(defaultvalue);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShow(isOpen);
      });
    } else {
      setTimeout(() => {
        setShow(isOpen);
      }, 150);
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (checked: boolean, name: string) => {
      const index = value.indexOf(name);

      if (index === -1 && checked) {
        setValue([...value, name]);
      } else if (index > -1) {
        const newValue = [...value];
        newValue.splice(index, 1);
        setValue(newValue);
      }
    },
    [value],
  );

  const handleDone = useCallback(() => {
    onChangeValue(value);
  }, [value, onChangeValue]);

  if (!isOpen && !show) return null;

  return (
    <section
      className={clsx(
        "fixed top-0 width-screen bg-background z-50 flex flex-col overflow-auto scroll-smooth gap-4 left-1/2 h-full delay-75 transition -translate-x-1/2",
        {
          "opacity-100 translate-y-0": show,
          "translate-y-1/2 opacity-0": !show || !isOpen,
        },
      )}
    >
      <Header title="Languages" onClose={onClose} />
      <section className="flex flex-col px-4">
        {languagesMock.map((lang) => (
          <CheckboxRow
            key={lang.value}
            label={lang.label}
            name={lang.value}
            value={value.includes(lang.value)}
            onChange={handleChange}
            className="border-b border-black/20 py-2 px-1 last:border-b-0"
          />
        ))}
      </section>
      <section className="sticky z-20 p-4 backdrop-blur-[2px] bottom-0 left-0 w-full mt-auto bg-tab/90 flex">
        <Button fullWidth color="primary" onPress={handleDone}>
          Done
        </Button>
      </section>
    </section>
  );
};

export default LanguagePickerModal;
