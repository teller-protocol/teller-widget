import { AddressStringType } from "../types/addressStringType";
import { ContractType, useReadContract, SupportedContractsEnum } from "./useReadContract";
import { useMemo } from "react"

export const useGetBorrowSwapData = ({
  principalTokenAddress,
  principalAmount,
  collateralTokenAddress,
}: {
  principalTokenAddress: string;
  principalAmount: number;
  collateralTokenAddress: string;
}) => {

  // using principal tokens & collateral token, query uniswap api to find highest TVL pool path and get that pool fee

  console.log("principalTokenAddress", principalTokenAddress);
  console.log("principalAmount", principalAmount);
  console.log("collateralTokenAddress", collateralTokenAddress);
  
  const borrowSwapPaths = useReadContract<bigint>(
    SupportedContractsEnum.BorrowSwap,
    "generateSwapPath",
    [principalTokenAddress, [(500, "0xa374094527e1673a86de625aa59517c5de346d32"),(10000, "0x692ac1e363ae34b6b489148152b12e2785a3d8d6")] ], // create example swap
    false,
    ContractType.External
  );

  const borrowQuoteExactInput = useReadContract<bigint>(
    SupportedContractsEnum.BorrowSwap,
    "quoteExactInput",
    [principalTokenAddress, principalAmount, borrowSwapPaths],
    false,
    ContractType.External
  );

  console.log("borrowSwapPaths", borrowSwapPaths);
  console.log("borrowQuoteExactInput", borrowQuoteExactInput);
  
  return useMemo(
    () => ({
      borrowSwapPaths,
      borrowQuoteExactInput,
    }),
    [
      borrowSwapPaths,
      borrowQuoteExactInput,
    ]
  );
};
