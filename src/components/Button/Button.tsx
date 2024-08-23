import cx from "classnames";
import "./button.scss";
import { useGetUserTokenContext } from "../../contexts/UserTokensContext";

export interface ButtonProps {
  label?: React.ReactNode;
  onClick?: (e?: any) => any;
  disabled?: boolean;
  isFullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "bare";
}

interface CustomCSSProperties extends React.CSSProperties {
  '--button-primary-color'?: string;
  '--button-primary-text-color'?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick = () => null,
  disabled = false,
  isFullWidth = false,
  label,
  children,
  className,
  variant = "primary",
}) => {
  const { buttonColorPrimary, buttonTextColorPrimary } = useGetUserTokenContext 
  ? useGetUserTokenContext() 
  : { buttonColorPrimary, buttonTextColorPrimary };
  
  const customStyle: CustomCSSProperties = {
    '--button-primary-color': buttonColorPrimary,
    '--button-primary-text-color': buttonTextColorPrimary,
  };
  
  return (
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
};

export default Button;
