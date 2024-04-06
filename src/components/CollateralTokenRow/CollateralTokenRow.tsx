import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";

interface CollateralTokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const CollateralTokenRow: React.FC<CollateralTokenSelectProps> = ({
  token,
  onClick,
}) => (
  <div
    className="collateral-token-list-select"
    onClick={() => onClick?.(token)}
  >
    <TokenLogo logoUrl={token?.logo} size={32} />
    <div className="token-balance-info">
      <span>{token?.symbol}</span>
      <span>
        Balance: {Number(token?.balance).toFixed(3)} {token?.symbol}
      </span>
    </div>
  </div>
);

export default CollateralTokenRow;
