import cx from "classnames";
import "./selectButtons.scss";

type SelectItem = {
  content: React.ReactNode;
  value: any;
};

interface SelectButtonProps {
  items: SelectItem[];
  value: string;
  onChange: (item: any) => void;
}

const SelectButtons: React.FC<SelectButtonProps> = ({
  items,
  onChange,
  value,
}) => (
  <div className="select-buttons">
    {items.map((item, index) => (
      <button
        key={`select-${index}`}
        className={cx("select-buttons__item", item.value === value && "active")}
        onClick={() => onChange(item.value)}
      >
        {item.content}
      </button>
    ))}
  </div>
);

export default SelectButtons;
