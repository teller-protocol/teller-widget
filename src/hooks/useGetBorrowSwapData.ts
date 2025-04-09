import { AddressStringType } from "../types/addressStringType";
import { ContractType, useReadContract, SupportedContractsEnum } from "./useReadContract";

export const useGetBorrowSwapData = ({
  principalTokenAddress,
  principalAmount,
  collateralTokenAddress,
}: {
  principalTokenAddress: string;
  principalAmount: string;
  collateralTokenAddress: string;
}) => {

  // using principal tokens & collateral token, query uniswap api to find highest TVL pool path and get that pool fee
  
  const borrowSwapPaths = useReadContract<bigint>(
    SupportedContractsEnum.BorrowSwap,
    "generateSwapPath",
    [principalTokenAddress, [(3000, ""),(3000, "")] ], // create example swap
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

  return {"borrowSwapPaths":borrowSwapPaths, "borrowQuoteExactInput":borrowQuoteExactInput};
};
