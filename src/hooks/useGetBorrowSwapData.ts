import { ContractType, useReadContract, SupportedContractsEnum } from "./useReadContract";
import { useMemo, useEffect } from "react";
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

  const swapPath = [
    {
      poolFee: 100,
      tokenOut: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    },
    {
      poolFee: 10000,
      tokenOut: "0x362d0401ed74db25219b6d02ac1791cfe3542d68",
    },
  ];

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
