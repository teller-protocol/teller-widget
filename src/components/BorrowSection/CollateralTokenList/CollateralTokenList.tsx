import { UserToken } from "../../../hooks/useGetUserTokens";

import CollateralTokenRow from "../../CollateralTokenRow";
import "./collateralTokenList.scss";

interface CollateralTokenListProps {
  tokens: UserToken[];
  onCollateralTokenSelected: (token: UserToken) => void;
}

const CollateralTokenList: React.FC<CollateralTokenListProps> = ({
  tokens,
  onCollateralTokenSelected,
}) => {
  return (
    <div className="collateral-token-list">
      <span>Select token collateral for deposit</span>
      {tokens.map((token) => (
        <CollateralTokenRow token={token} onClick={onCollateralTokenSelected} />
      ))}
    </div>
  );
};

export default CollateralTokenList;
