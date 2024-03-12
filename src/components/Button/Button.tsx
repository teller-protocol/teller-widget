import cx from "classnames";
import "./button.scss";

export interface ButtonProps {
  label: string;
  onClick?: (e?: any) => any;
  disabled?: boolean;
  isFullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick = () => null,
  disabled = false,
  isFullWidth = false,
  label,
}) => {
  return (
    <button
      className={cx(
        "teller-widget-button",
        isFullWidth && "full-width",
        disabled && "disabled"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <>{label}</>
    </button>
  );
};

export default Button;
