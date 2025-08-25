import { Address } from "viem";

import { ContractType, useReadContract } from "./useReadContract";

export const useGetAPRForLiquidityPools = (
  address: Address,
  principalAmount: string,
  isV2: boolean,
  skip: boolean = false
) => {
  const { data, isLoading } = useReadContract<string>(
    address,
    "getMinInterestRate",
    [principalAmount],
    skip,
    isV2 ? ContractType.LenderGroupsV2 : ContractType.LenderGroups
  );

  return { data, isLoading };
};
