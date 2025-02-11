import cx from "classnames";
import { useState } from "react";

import useOutsideClick from "../../hooks/useOutsideClick";
import "./dropdown.scss";
import { Icon } from "@iconify/react";

export interface DropdownOption<L = React.ReactNode> {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedOption?: DropdownOption;
  onChange: (option: DropdownOption) => void;
  label?: string;
  readonly?: boolean;
}

interface DropdownButtonProps {
  option: DropdownOption;
  onClick?: (token: DropdownOption) => void;
}

const DropdownRow: React.FC<DropdownButtonProps> = ({ option, onClick }) => (
  <div className="token-dropdown--row" onClick={() => onClick?.(option)}>
    <div className="token-info">
      <div className="paragraph">{option?.label}</div>
    </div>
  </div>
);

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedOption,
  onChange,
  label,
  readonly,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onDropdownRowClick = (option: DropdownOption) => {
    onChange(option);
    setIsOpen(false);
  };

  const ref = useOutsideClick(() => setIsOpen(false));

  return (
    <>
      {label && <label className="section-title">{label}</label>}
      <div className="token-dropdown" ref={ref}>
        <div
          className={cx("token-dropdown--row-container", isOpen && "opened")}
          onClick={() => !readonly && setIsOpen(!isOpen)}
        >
          <DropdownRow option={selectedOption ?? { label: "", value: "" }} />
          {!readonly && (
            <div className={cx("caret", isOpen && "opened")}>
              <Icon icon="clarity:caret-line" />
            </div>
          )}
        </div>
        {isOpen && options.length > 0 && (
          <div className="token-dropdown--tokens">
            {options.map((option) => (
              <DropdownRow
                option={option}
                key={option.value}
                onClick={onDropdownRowClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dropdown;
