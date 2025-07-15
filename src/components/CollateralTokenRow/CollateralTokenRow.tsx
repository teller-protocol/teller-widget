import DataPill from "../../components/DataPill";
import { mapChainIdToName } from "../../constants/chains";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import "./collateralTokenRow.scss";
import { UserToken } from "../../hooks/useGetUserTokens";
import { useTokenLogoAndSymbolWithFallback } from "../../hooks/useTokenLogoAndSymbolWithFallback";
import { mapChainToImage } from "../ChainSwitch/ChainSwitch";
import TokenLogo from "../TokenLogo";

interface CollateralTokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const CollateralTokenRow: React.FC<CollateralTokenSelectProps> = ({
  token,
  onClick,
}) => {
  const logoAndSymbol = useTokenLogoAndSymbolWithFallback(token);

  if (!logoAndSymbol) return null;

  return (
    <div
      className="collateral-token-row"
      onClick={() =>
        onClick?.({
          ...token,
          ...logoAndSymbol,
        })
      }
    >
      <TokenLogo logoUrl={logoAndSymbol.logo} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">{logoAndSymbol.symbol}</span>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Balance: ${numberWithCommasAndDecimals(token?.balance)} ${
              logoAndSymbol.symbol
            }`
          )}
        </span>
      </div>
      {token.rewardPercent !== undefined && (
        <DataPill
          variant="small"
          label={`+${token.rewardPercent}% Reward ✨`}
        />
      )}
    </div>
  );
};

export default CollateralTokenRow;
