
import { useEffect, useState } from 'react';
import { UserToken } from './useGetUserTokens';
import { useGetUniswapV3LiquidityPools } from './queries/useGetUniswapV3Pools';
import { useUniswapV3PoolUSDValue } from './useUniswapV3PoolUSDValue';
import { UniswapData } from '../pages/BorrowSection/BorrowSectionContext';

export const useUniswapDataForTokens = (tokens: UserToken[]) => {
  const [uniswapDataMap, setUniswapDataMap] = useState<Record<string, UniswapData>>({});

  useEffect(() => {
    tokens.forEach((token) => {
      const { bestPool, aggregatedFeesUSD, isLoading: isLiquidityLoading } = 
        useGetUniswapV3LiquidityPools({
          tokenAddress: token.address,
          days: 30,
        });

      const { totalUSDValue, isLoading: isPoolValueLoading } = useUniswapV3PoolUSDValue({
        poolAddress: bestPool?.id || "",
      });

      if (!isLiquidityLoading && !isPoolValueLoading && bestPool && aggregatedFeesUSD != null) {
        const fees = parseFloat(aggregatedFeesUSD);
        const apy = totalUSDValue && totalUSDValue > 0
          ? (((fees / totalUSDValue) * (365 / 30)) * 100).toFixed(0)
          : "0";

        setUniswapDataMap(prev => ({
          ...prev,
          [token.address]: { bestPool, aggregatedFeesUSD, totalUSDValue, apy }
        }));
      }
    });
  }, [tokens]);

  return uniswapDataMap;
};
