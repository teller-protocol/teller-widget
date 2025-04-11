import {
  ContractType,
  useReadContract,
  SupportedContractsEnum,
} from "./useReadContract";
import { useMemo, useEffect, useState } from "react";
import { useBestUniswapV3Route } from "./queries/useGetUniswapRoutes";

export const useGetBorrowSwapData = ({
  principalTokenAddress,
  principalAmount,
  finalTokenAddress,
}: {
  principalTokenAddress?: string;
  principalAmount?: string;
  finalTokenAddress?: string;
}) => {
  // uniswap data
  const { pools: swapRoute, liquidityInsufficient } = useBestUniswapV3Route(
    principalTokenAddress,
    finalTokenAddress
  );

  const swapPath = useMemo(() => {
    if (!swapRoute || swapRoute.length === 0) return [];
    return swapRoute.map((pool) => ({
      poolFee: pool[2],
      tokenOut: pool[0],
    }));
  }, [swapRoute]);

  const isReady =
    !!principalTokenAddress &&
    !!principalAmount &&
    !!finalTokenAddress &&
    swapPath.length > 0;


  const borrowSwapPaths = useReadContract<string>(
    SupportedContractsEnum.BorrowSwap,
    "generateSwapPath",
    isReady ? [principalTokenAddress, swapPath] : [],
    false
  );

  const borrowQuoteExactInput = useReadContract<bigint>(
    SupportedContractsEnum.BorrowSwap,
    "quoteExactInput",
    isReady ? [principalTokenAddress, BigInt(principalAmount), swapPath] : [],
    false
  );

  return useMemo(
    () => ({
      borrowSwapPaths: swapPath,
      borrowQuoteExactInput: borrowQuoteExactInput.data,
    }),
    [swapPath, borrowQuoteExactInput.data]
  );
};
