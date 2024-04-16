import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";

import "./collateralTokenRow.scss";

interface CollateralTokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const CollateralTokenRow: React.FC<CollateralTokenSelectProps> = ({
  token,
  onClick,
}) => (
  <div className="collateral-token-row" onClick={() => onClick?.(token)}>
    <TokenLogo logoUrl={token?.logo} size={32} />
    <div className="token-balance-info">
      <span className="paragraph">{token?.symbol}</span>
      <span className="section-sub-title">
        Balance: {Number(token?.balance).toFixed(3)} {token?.symbol}
      </span>
    </div>
  </div>
);

export default CollateralTokenRow;
