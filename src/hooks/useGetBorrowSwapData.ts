import { ContractType, useReadContract, SupportedContractsEnum } from "./useReadContract";
import { useMemo, useEffect, useState } from "react";
import { useBestUniswapV3Route } from "./queries/useGetUniswapRoutes";

export const useGetBorrowSwapData = ({
  principalTokenAddress,
  principalAmount,
  collateralTokenAddress,
}: {
  principalTokenAddress?: string;
  principalAmount?: string;
  collateralTokenAddress?: string;
}) => {
  // uniswap data
  const { pools: swapRoute, liquidityInsufficient } = useBestUniswapV3Route(
    principalTokenAddress,
    collateralTokenAddress
  )

  const isReady =
    !!principalTokenAddress && !!principalAmount && !!collateralTokenAddress && !!swapRoute;

  console.log("swapRoute", swapRoute)
  console.log("liquidityInsufficient", liquidityInsufficient)

  const [swapPath, setSwapPath] = useState<
    { tokenOut: string; poolFee: number }[]
  >([]);

  // Dynamically transform swapRoute to swapPath when swapRoute is ready
  useEffect(() => {
    if (!swapRoute || swapRoute.length === 0) return;

    const path = swapRoute.map((pool) => ({
      tokenOut: pool[0],
      poolFee: pool[2],
    }));

    setSwapPath(path);
  }, [swapRoute]);

  /*
   {
     poolFee: 500,
     tokenOut: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
   },
   {
     poolFee: 10000,
     tokenOut: "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
   },
   */

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

  useEffect(() => {
    console.log("Inputs:", {
      principalTokenAddress,
      principalAmount,
      collateralTokenAddress,
      swapRoute,
      swapPath
    });
  }, [principalTokenAddress, principalAmount, collateralTokenAddress, swapRoute]);

  return useMemo(
    () => ({
      borrowSwapPaths: swapPath,
      borrowQuoteExactInput: borrowQuoteExactInput.data,
    }),
    [borrowSwapPaths, borrowQuoteExactInput]
  );
};
