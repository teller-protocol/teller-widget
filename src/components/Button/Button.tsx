import cx from "classnames";
import "./button.scss";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import {
  TransactionButtonProvider,
  useTransactionButton,
} from "../../contexts/TransactionButtonContext";
import { useEffect } from "react";
export interface ButtonProps {
  label?: React.ReactNode;
  onClick?: (e?: any) => any;
  disabled?: boolean;
  isFullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "bare";
  useTransactionButtonContext?: boolean;
}

interface CustomCSSProperties extends React.CSSProperties {
  "--button-primary-color"?: string;
  "--button-primary-text-color"?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick = () => null,
  disabled = false,
  isFullWidth = false,
  label,
  children,
  className,
  variant = "primary",
  useTransactionButtonContext = false,
}) => {
  const { buttonColorPrimary, buttonTextColorPrimary } =
    useGetGlobalPropsContext();

  const { setTransactionButtonPresent } = useTransactionButton();

  useEffect(() => {
    setTransactionButtonPresent(true);
    return () => setTransactionButtonPresent(false);
  }, [setTransactionButtonPresent]);

  const customStyle: CustomCSSProperties = {
    "--button-primary-color": buttonColorPrimary,
    "--button-primary-text-color": buttonTextColorPrimary,
  };

  const Button = (
    <button
      className={cx(
        "teller-widget-button",
        isFullWidth && "full-width",
        disabled && "disabled",
        className,
        variant
      )}
      style={customStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children ? <>{children}</> : <>{label}</>}
    </button>
  );

  return Button;
};

export default Button;
