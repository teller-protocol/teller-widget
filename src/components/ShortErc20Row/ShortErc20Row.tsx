import React from "react";
import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import "./shortErc20Row.scss";
import { mapChainToImage } from "../ChainSwitch/ChainSwitch";
import { mapChainIdToName } from "../../constants/chains";
import { useTokenLogoAndSymbolWithFallback } from "../../hooks/useTokenLogoAndSymbolWithFallback";

interface ShortErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const ShortErc20TokenRow: React.FC<ShortErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  const logoAndSymbol = useTokenLogoAndSymbolWithFallback(token);

  if (!logoAndSymbol) return null;

  return (
    <div className="short-erc20-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoAndSymbol.logo} size={32} />
      <div className="token-balance-info">
        <div className="symbol-data-row">
          <span className="paragraph">{logoAndSymbol.symbol}</span>
        </div>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Short up to: ${numberWithCommasAndDecimals(token.balance)} ${
              logoAndSymbol.symbol
            }`
          )}
        </span>
      </div>
    </div>
  );
};

export default ShortErc20TokenRow;
