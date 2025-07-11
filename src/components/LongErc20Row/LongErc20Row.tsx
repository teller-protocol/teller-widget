import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import { UserToken } from "../../hooks/useGetUserTokens";
import { useTokenLogoAndSymbolWithFallback } from "../../hooks/useTokenLogoAndSymbolWithFallback";
import TokenLogo from "../TokenLogo";

import "./longErc20Row.scss";

interface LongErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const LongErc20TokenRow: React.FC<LongErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  const logoAndSymbol = useTokenLogoAndSymbolWithFallback(token);

  if (!logoAndSymbol) return null;

  return (
    <div className="long-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoAndSymbol.logo} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">{logoAndSymbol.symbol}</span>
        <span className="section-sub-title">
          Long with: {numberWithCommasAndDecimals(token?.balance)}{" "}
          {logoAndSymbol.symbol}
        </span>
      </div>
    </div>
  );
};

export default LongErc20TokenRow;
