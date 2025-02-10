import { useGetUniswapV3LiquidityPools } from "../../hooks/queries/useGetUniswapV3Pools";
import { useUniswapV3PoolUSDValue } from "../../hooks/useUniswapV3PoolUSDValue";

export type UniswapData = {
  bestPool: any; // Replace with your actual pool type if available.
  aggregatedFeesUSD: string;
  totalUSDValue: number;
  apy: string;
  isLoading: boolean;
};

export function useUniswapV3Data(tokenAddress: string): UniswapData {
  // Use your existing hook to get liquidity pool data.
  const {
    bestPool,
    aggregatedFeesUSD,
    isLoading: isLiquidityLoading,
  } = useGetUniswapV3LiquidityPools({
    tokenAddress,
    days: 30,
  });

  // Use your existing hook to get the pool’s USD value.
  const { totalUSDValue, isLoading: isPoolValueLoading } =
    useUniswapV3PoolUSDValue({
      poolAddress: bestPool?.id || "",
    });

  // Combine the loading states.
  const isLoading = isLiquidityLoading || isPoolValueLoading;

  // Compute the APY once both data pieces are available.
  let apy = "0";
  if (!isLoading && bestPool && aggregatedFeesUSD != null && totalUSDValue != null) {
    const fees = parseFloat(aggregatedFeesUSD);
    // APY = ((fees / totalUSDValue) * (365 / 30)) * 100, rounded to 0 decimals.
    apy =
      totalUSDValue > 0
        ? (((fees / totalUSDValue) * (365 / 30)) * 100).toFixed(0)
        : "0";
  }

  return { bestPool, aggregatedFeesUSD, totalUSDValue, apy, isLoading };
}