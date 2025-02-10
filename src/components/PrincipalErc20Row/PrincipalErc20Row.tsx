// PrincipalErc20TokenRow.tsx
import React from 'react';
import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import DataPill from "../../components/DataPill";
import { useGetUniswapV3LiquidityPools } from "../../hooks/queries/useGetUniswapV3Pools";
import { useUniswapV3PoolUSDValue } from "../../hooks/useUniswapV3PoolUSDValue";
import "./principalErc20Row.scss";

interface PrincipalErc20TokenSelectProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const PrincipalErc20TokenRow: React.FC<PrincipalErc20TokenSelectProps> = ({
  token,
  onClick,
}) => {
  // Call hooks at the top-level of the component.
  const { bestPool, aggregatedFeesUSD } = useGetUniswapV3LiquidityPools({
    tokenAddress: token.address,
    days: 30,
  });

  // Use bestPool.id only if bestPool is defined.
  const { totalUSDValue } = useUniswapV3PoolUSDValue({
    poolAddress: bestPool?.id || '',
  });

  // Calculate APY if totalUSDValue is available.
  const fees = parseFloat(aggregatedFeesUSD);
  const apy =
    totalUSDValue && totalUSDValue > 0
      ? (((fees / totalUSDValue) * (365 / 30)) * 100).toFixed(0)
      : "0";

  console.log("fees", fees)
  console.log("totalUSDValue", totalUSDValue)

  const logoUrl = token.logo || defaultTokenImage;

  return (
    <div className="principal-erc20-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <div className="symbol-data-row">
          <span className="paragraph">{token.symbol}</span>
          <span style={{ fontSize: "11px", padding: "2px 5px" }}>
            <DataPill
              label={`${apy}% APY`}
              logo={"https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"}
            />
          </span>
        </div>
        <span className="section-sub-title">
          Borrow: {numberWithCommasAndDecimals(token.balance)} {token.symbol}
        </span>
      </div>
    </div>
  );
};

export default PrincipalErc20TokenRow;
