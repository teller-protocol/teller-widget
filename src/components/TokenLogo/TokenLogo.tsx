import "./tokenLogo.scss";

interface TokenLogoProps {
  logoUrl?: string | null;
  size?: number;
}

const TokenLogo: React.FC<TokenLogoProps> = ({ logoUrl, size = 13 }) => {
  return (
    <img
      className="token-logo"
      src={logoUrl ?? ""}
      alt="Token logo"
      height={size}
      width={size}
    />
  );
};

export default TokenLogo;
