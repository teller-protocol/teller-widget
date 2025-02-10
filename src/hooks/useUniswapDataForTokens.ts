
import { useEffect, useState } from 'react';
import { UserToken } from './useGetUserTokens';
import { useGetUniswapV3LiquidityPools } from './queries/useGetUniswapV3Pools';
import { useUniswapV3PoolUSDValue } from './useUniswapV3PoolUSDValue';
import { UniswapData } from '../pages/BorrowSection/BorrowSectionContext';

export const useUniswapDataForTokens = (tokens: UserToken[]) => {
  const [uniswapDataMap, setUniswapDataMap] = useState<Record<string, UniswapData>>({});
  
  // Create separate hooks for each token
  const poolsData = tokens.map(token => 
    useGetUniswapV3LiquidityPools({
      tokenAddress: token.address,
      days: 30,
    })
  );

  const poolValues = poolsData.map(data => 
    useUniswapV3PoolUSDValue({
      poolAddress: data.bestPool?.id || "",
    })
  );

  useEffect(() => {
    const newUniswapDataMap: Record<string, UniswapData> = {};

    tokens.forEach((token, index) => {
      const { bestPool, aggregatedFeesUSD, isLoading: isLiquidityLoading } = poolsData[index];
      const { totalUSDValue, isLoading: isPoolValueLoading } = poolValues[index];

      if (!isLiquidityLoading && !isPoolValueLoading && bestPool && aggregatedFeesUSD != null) {
        const fees = parseFloat(aggregatedFeesUSD);
        const apy = totalUSDValue && totalUSDValue > 0
          ? (((fees / totalUSDValue) * (365 / 30)) * 100).toFixed(0)
          : "0";

        newUniswapDataMap[token.address] = { 
          bestPool, 
          aggregatedFeesUSD, 
          totalUSDValue, 
          apy 
        };
      }
    });

    setUniswapDataMap(newUniswapDataMap);
  }, [tokens, poolsData, poolValues]);

  return uniswapDataMap;
};
