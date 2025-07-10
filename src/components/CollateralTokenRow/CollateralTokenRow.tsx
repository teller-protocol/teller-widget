import { useMemo } from "react";

import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { mapChainIdToName } from "../../constants/chains";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import "./collateralTokenRow.scss";
import { useGetTokenImageAndSymbolFromTokenList } from "../../hooks/useGetTokenImageAndSymbolFromTokenList";
import { UserToken } from "../../hooks/useGetUserTokens";
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
  const { getTokenImageAndSymbolFromTokenList } =
    useGetTokenImageAndSymbolFromTokenList();

  const data = useMemo<{ symbol: string; logo: string }>(() => {
    const data = getTokenImageAndSymbolFromTokenList(token.address);

    return {
      logo: token?.logo || data?.image || defaultTokenImage,
      symbol: token?.symbol || data?.symbol || "",
    };
  }, [token, getTokenImageAndSymbolFromTokenList]);

  return (
    <div className="collateral-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={data.logo} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">{data.symbol}</span>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Balance: ${numberWithCommasAndDecimals(token?.balance)} ${
              data.symbol
            }`
          )}
        </span>
      </div>
    </div>
  );
};

export default CollateralTokenRow;
