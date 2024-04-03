import { useMemo } from "react";
import { useContracts } from "./useContracts";
import { useChainId, useReadContract } from "wagmi";

export enum SupportedContractsEnum {
  "TellerV2" = "TellerV2",
  "FlashRolloverLoan" = "FlashRolloverLoan",
  "MarketRegistry" = "MarketRegistry",
  "LenderCommitmentForwarder" = "LenderCommitmentForwarder",
  "LenderCommitmentForwarderStaging" = "LenderCommitmentForwarderStaging",
  "LenderCommitmentForwarderAlpha" = "LenderCommitmentForwarderAlpha",
  "MarketLiquidityRewards" = "MarketLiquidityRewards",
  "CollateralManager" = "CollateralManager",
}

enum ContractType {
  Teller = "Teller",
}

export const useContractRead = <T = any>(
  contractName: SupportedContractsEnum,
  functionName: string,
  args: any[],
  contractType = ContractType.Teller
) => {
  const contracts = useContracts();
  const chainId = useChainId();

  const mapAbi = useMemo(
    () => ({
      [ContractType.Teller]: contracts[contractName]?.abi,
    }),
    [contractName, contracts]
  );

  const address =
    contractType === ContractType.Teller
      ? contracts[contractName]?.address
      : contractName;

  const { data, error, isLoading, refetch, isRefetching } = useReadContract({
    address,
    abi: mapAbi[contractType],
    functionName,
    args,
    chainId: chainId,
  });

  return useMemo(() => {
    return {
      data: data as T | undefined,
      error,
      isLoading,
      refetch,
      isRefetching,
    };
  }, [data, error, isLoading, refetch, isRefetching]);
};
