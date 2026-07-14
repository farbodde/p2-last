import React from "react";

export type CheckboxProps = {
  name: string;
  value?: boolean;
  onChange: (checked: boolean, name: string) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ name, value, onChange }) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.checked, name);
  };
  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        name={name}
        id={name}
        className="hidden"
        checked={value}
        onChange={handleChange}
      />
      <span className="checkbox-el relative transition items-center justify-center border-1.5 p-0.5 border-white/20 w-5 h-5 flex rounded-md" />
    </label>
  );
};

export default Checkbox;
