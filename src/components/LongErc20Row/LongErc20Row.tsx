import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";

import "./longErc20Row.scss";

interface LongErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const LongErc20TokenRow: React.FC<LongErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  const logoUrl = token?.logo ? token.logo : defaultTokenImage;

  return (
    <div className="long-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">{token?.symbol}</span>
        <span className="section-sub-title">
          Long with: {numberWithCommasAndDecimals(token?.balance)} {token?.symbol}
        </span>
      </div>
    </div>
  );
};

export default LongErc20TokenRow;
