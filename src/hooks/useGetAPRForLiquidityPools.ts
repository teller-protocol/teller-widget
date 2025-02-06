import { Address } from "viem";
import { ContractType, useReadContract } from "./useReadContract";

export const useGetAPRForLiquidityPools = (
  address: Address,
  principalAmount: string
) => {
  const { data } = useReadContract(
    address,
    "getMinInterestRate",
    [principalAmount],
    false,
    ContractType.LenderGroups
  );

  return data;
};
