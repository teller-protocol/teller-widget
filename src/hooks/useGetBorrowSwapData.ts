import { ContractType, useReadContract, SupportedContractsEnum } from "./useReadContract";
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
  )

  const swapPath = useMemo(() => {
    if (!swapRoute || swapRoute.length === 0) return [];
    return swapRoute.map((pool) => ({
      poolFee: pool[2],
      tokenOut: pool[0],
    }));
  }, [swapRoute]);
  
  
  /*const swapPath = 
   [
     {
       poolFee: 100,
       tokenOut: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
     },
     {
       poolFee: 10000,
       tokenOut: "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
     },
   ]*/

  const isReady =
    !!principalTokenAddress &&
    !!principalAmount &&
    !!finalTokenAddress &&
    swapPath.length > 0;
   

  const borrowSwapPaths = useReadContract<string>(
    SupportedContractsEnum.BorrowSwap,
    "generateSwapPath",
    isReady ? [principalTokenAddress, swapPath] : [],
    false,
    ContractType.External
  );

  const borrowQuoteExactInput = useReadContract<bigint>(
    SupportedContractsEnum.BorrowSwap,
    "quoteExactInput",
    isReady
      ? [principalTokenAddress, BigInt(principalAmount), swapPath]
      : [],
    false,
    ContractType.External
  );

  return useMemo(
    () => ({
      borrowSwapPaths: swapPath,
      borrowQuoteExactInput: borrowQuoteExactInput.data,
    }),
    [borrowSwapPaths, borrowQuoteExactInput]
  );
};
