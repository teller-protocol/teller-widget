import cx from "classnames";
import "./checkbox.scss";

interface CheckboxProps {
  checked: boolean;
  setChecked: (value: boolean) => void;
  label: React.ReactNode;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  setChecked,
  label,
  className,
}) => {
  return (
    <label className={cx(className, "checkbox")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <span className="checkbox-label"> {label} </span>
    </label>
  );
};

export default Checkbox;
