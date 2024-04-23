import cx from "classnames";
import "./button.scss";

export interface ButtonProps {
  label?: string;
  onClick?: (e?: any) => any;
  disabled?: boolean;
  isFullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick = () => null,
  disabled = false,
  isFullWidth = false,
  label,
  children,
  className,
}) => {
  return (
    <button
      className={cx(
        "teller-widget-button",
        isFullWidth && "full-width",
        disabled && "disabled",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children ? <>{children}</> : <>{label}</>}
    </button>
  );
};

export default Button;
