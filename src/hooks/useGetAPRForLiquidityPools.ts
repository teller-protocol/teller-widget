import { Address } from "viem";

import { ContractType, useReadContract } from "./useReadContract";

export const useGetAPRForLiquidityPools = (
  address: Address,
  principalAmount: string,
  skip: boolean = false
) => {
  const { data, isLoading } = useReadContract<string>(
    address,
    "getMinInterestRate",
    [principalAmount],
    skip,
    ContractType.LenderGroups
  );

  return { data, isLoading };
};
