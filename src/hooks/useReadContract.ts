import { useMemo } from "react";
import { erc20Abi } from "viem";
import { useChainId, useReadContract as useWagmiReadContract } from "wagmi";

import { useContracts } from "./useContracts";

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

export enum ContractType {
  Teller = "Teller",
  ERC20 = "ERC20",
}

export const useReadContract = <T = any>(
  contractName: SupportedContractsEnum | string,
  functionName: string,
  args: any[],
  skipRun = false,
  contractType = ContractType.Teller
) => {
  const contracts = useContracts();
  const chainId = useChainId();

  const mapAbi = useMemo(
    () => ({
      [ContractType.Teller]: contracts[contractName]?.abi,
      [ContractType.ERC20]: erc20Abi,
    }),
    [contractName, contracts]
  );

  const address =
    contractType === ContractType.Teller
      ? contracts[contractName]?.address
      : contractName;
  const { data, error, isLoading, refetch, isRefetching } =
    useWagmiReadContract({
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
