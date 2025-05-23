// ShortErc20TokenRow.tsx
import React from "react";
import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import DataPill from "../../components/DataPill";
import "./shortErc20Row.scss";
import { useGetBorrowSectionContext } from "../../pages/BorrowSection/BorrowSectionContext";
import Loader from "../Loader";
import { mapChainToImage } from "../ChainSwitch/ChainSwitch";
import { mapChainIdToName } from "../../constants/chains";

interface ShortErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const ShortErc20TokenRow: React.FC<ShortErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  const { uniswapDataMap } = useGetBorrowSectionContext();
  const logoUrl = token.logo || defaultTokenImage;

  const uniswapData = uniswapDataMap[token.address];

  return (
    <div className="short-erc20-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <div className="symbol-data-row">
          <span className="paragraph">{token.symbol}</span>
        </div>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Short up to: ${numberWithCommasAndDecimals(token.balance)} ${
              token.symbol
            }`
          )}
        </span>
      </div>
    </div>
  );
};

export default ShortErc20TokenRow;
