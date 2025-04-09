import { ContractType, useReadContract, SupportedContractsEnum } from "./useReadContract";
import { useMemo } from "react";

export const useGetBorrowSwapData = ({
  principalTokenAddress,
  principalAmount,
  collateralTokenAddress,
}: {
  principalTokenAddress?: string;
  principalAmount?: string;
  collateralTokenAddress?: string;
}) => {
  const isReady =
    !!principalTokenAddress && !!principalAmount && !!collateralTokenAddress;

  const swapPath = [
    {
      poolFee: 500,
      tokenOut: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    },
    {
      poolFee: 10000,
      tokenOut: "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
    },
  ];

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
