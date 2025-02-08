import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";

import "./principalErc20Row.scss";

interface PrincipalErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const PrincipalErc20TokenRow: React.FC<PrincipalErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  const logoUrl = token?.logo ? token.logo : defaultTokenImage;

  return (
    <div className="principal-erc20-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">{token?.symbol}</span>
        <span className="section-sub-title">
          Available: {numberWithCommasAndDecimals(token?.balance)} {token?.symbol}
        </span>
      </div>
    </div>
  );
};

export default PrincipalErc20TokenRow;
