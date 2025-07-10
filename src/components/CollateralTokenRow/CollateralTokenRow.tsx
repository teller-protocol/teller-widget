import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import { mapChainIdToName } from "../../constants/chains";
import "./collateralTokenRow.scss";
import { mapChainToImage } from "../ChainSwitch/ChainSwitch";
import DataPill from "../../components/DataPill";

interface CollateralTokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const CollateralTokenRow: React.FC<CollateralTokenSelectProps> = ({
  token,
  onClick,
}) => {
  const logoUrl = token?.logo ? token.logo : defaultTokenImage;

  return (
    <div className="collateral-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">{token?.symbol}</span>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Balance: ${numberWithCommasAndDecimals(token?.balance)} ${
              token?.symbol
            }`
          )}
        </span>
      </div>
      {token.rewardPercent !== undefined && (
        <DataPill
          variant="small"
          label={`+${token.rewardPercent}% APR Reward ✨`}
        />
      )}
    </div>
  );
};

export default CollateralTokenRow;
