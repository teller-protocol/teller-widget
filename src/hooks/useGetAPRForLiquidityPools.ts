import { Address } from "viem";
import { ContractType, useReadContract } from "./useReadContract";
import { useLenderGroupsContractType } from "./useLenderGroupsContractType";

export const useGetAPRForLiquidityPools = (
  address: Address,
  principalAmount: string,
  skip: boolean = false
) => {
  const lenderGroupsContractType = useLenderGroupsContractType();
  const { data, isLoading } = useReadContract(
    address,
    "getMinInterestRate",
    [principalAmount],
    skip,
    lenderGroupsContractType
  );

  return { data, isLoading };
};
