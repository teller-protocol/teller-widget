// PrincipalErc20TokenRow.tsx
import React from "react";
import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import DataPill from "../../components/DataPill";
import "./principalErc20Row.scss";
import { useGetBorrowSectionContext } from "../../pages/BorrowSection/BorrowSectionContext";
import Loader from "../Loader";
import { useTokenLogoAndSymbolWithFallback } from "../../hooks/useTokenLogoAndSymbolWithFallback";

interface PrincipalErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const PrincipalErc20TokenRow: React.FC<PrincipalErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  const { uniswapDataMap } = useGetBorrowSectionContext();
  const logoAndSymbol = useTokenLogoAndSymbolWithFallback(token);

  const uniswapData = uniswapDataMap[token.address];
  const apy = uniswapData?.apy ?? "";

  if (!logoAndSymbol) return null;

  return (
    <div className="principal-erc20-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoAndSymbol.logo} size={32} />
      <div className="token-balance-info">
        <div className="symbol-data-row">
          <span className="paragraph">{logoAndSymbol.symbol}</span>
          <span style={{ fontSize: "11px", padding: "2px 5px" }}>
            {!apy ? (
              <Loader isSkeleton height={19} />
            ) : (
              <DataPill
                label={`${apy}% APY`}
                logo="https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"
              />
            )}
          </span>
        </div>
        <span className="section-sub-title">
          Farm up to: {numberWithCommasAndDecimals(token.balance)}{" "}
          {logoAndSymbol.symbol}
        </span>
      </div>
    </div>
  );
};

export default PrincipalErc20TokenRow;
