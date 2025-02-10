import React from "react";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import { formatUnits } from "viem";
import { UserToken } from "../../../hooks/useGetUserTokens";
import { useGetUniswapV3LiquidityPools } from "../../../hooks/queries/useGetUniswapV3Pools";
import { useUniswapV3PoolUSDValue } from "../../../hooks/useUniswapV3PoolUSDValue";
import PrincipalErc20TokenRow from "../../../components/PrincipalErc20Row";
import "./principalErc20List.scss";

import TokenLogo from "../../../components/TokenLogo";
import "../../../components/PrincipalErc20Row/principalErc20Row.scss";

const PrincipalErc20List: React.FC<{ searchQuery?: string }> = ({ searchQuery = "" }) => {
  const { principalErc20Tokens } = useGetBorrowSectionContext();

  const filteredTokens = principalErc20Tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    setCurrentStep,
    setSelectedPrincipalErc20Token,
  } = useGetBorrowSectionContext();

  const onPrincipalErc20TokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
      setSelectedPrincipalErc20Token(token);
  };

  /*
  const tokenAddress = "0x594daad7d77592a2b97b725a7ad59d7e188b5bfa";
  // Optionally, specify the number of days to aggregate fees (defaults to 30 if omitted).
  const { bestPool, poolDayDatas, aggregatedFeesUSD, isLoading: liquidityPoolIsLoading } = useGetUniswapV3LiquidityPools({
    tokenAddress,
    days: 30,
  });

  console.log("bestPool id", bestPool?.id)
  console.log("aggregatedFeesUSD", aggregatedFeesUSD)

  const poolAddress = bestPool?.id ?? ""; // can be dynamic
  const ethPrice = 2628.5; // replace with a dynamic value if needed
  const { totalUSDValue, isLoading: poolUSDValueIsLoading } = useUniswapV3PoolUSDValue({
    poolAddress,
    ethPrice,
  });

  console.log("totalUSDValue", totalUSDValue)

  // Make sure to convert aggregatedFeesUSD from a string to a number.
  const fees = parseFloat(aggregatedFeesUSD);

  // Only compute APY if totalUSDValue is greater than 0.
  const uniswapAPY =
    totalUSDValue > 0
      ? (((fees / totalUSDValue) * (365 / 30)) * 100).toFixed(2)
      : "0";

  console.log("Uniswap APY:", uniswapAPY + "%");
  */
  

  return (
    <div className="principal-erc20-list">
      <div className="principal-erc20-token-row" 
        style={{
          border:"none", 
          backgroundColor: "rgba(190, 190, 190, 0.1)",
          pointerEvents: "none",
        }}>
        <TokenLogo logoUrl={"https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"} size={32} />
        <div className="token-balance-info">
          <span className="paragraph">Borrow {'>'} Earn APY</span>
          <span className="section-sub-title" style={{fontSize: "9px",}}>
            Source liquidity to pool on Uniswap
          </span>
        </div>
      </div>
      {filteredTokens.map((token) => (
        <PrincipalErc20TokenRow
          key={token.address}
          token={token}
          onClick={() => onPrincipalErc20TokenSelected(token)}
        />
      ))}
    </div>
  );
};

export default PrincipalErc20List;
