import { useMemo } from "react";
import { Address, erc20Abi } from "viem";
import { useChainId, useReadContract as useWagmiReadContract } from "wagmi";

import { useContracts } from "./useContracts";
import externalContracts from "../constants/externalContracts";

export enum SupportedContractsEnum {
  "TellerV2" = "TellerV2",
  "FlashRolloverLoan" = "FlashRolloverLoan",
  "FlashRolloverLoanWidget" = "FlashRolloverLoanWidget",
  "MarketRegistry" = "MarketRegistry",
  "LenderCommitmentForwarder" = "LenderCommitmentForwarder",
  "LenderCommitmentForwarderStaging" = "LenderCommitmentForwarderStaging",
  "LenderCommitmentForwarderAlpha" = "LenderCommitmentForwarderAlpha",
  "LoanReferralForwarder" = "LoanReferralForwarder",
  "RolloverForWidget" = "RolloverForWidget",
  "MarketLiquidityRewards" = "MarketLiquidityRewards",
  "CollateralManager" = "CollateralManager",
  "LenderGroups" = "LenderCommitmentGroupBeacon",
  "SmartCommitmentForwarder" = "SmartCommitmentForwarder",
}

export enum ContractType {
  Teller = "Teller",
  ERC20 = "ERC20",
  External = "External",
  LenderGroups = "LenderCommitmentGroupBeacon",
}

export const useReadContract = <T = any>(
  contractName: SupportedContractsEnum | Address | undefined,
  functionName: string,
  args: any[],
  skipRun = false,
  contractType = ContractType.Teller
) => {
  const contracts = useContracts();
  const chainId = useChainId();

  const mapAbi = useMemo(
    () => ({
      [ContractType.Teller]: contracts[contractName ?? ""]?.abi,
      [ContractType.External]:
        externalContracts[chainId]["contracts"][contractName ?? ""]?.abi,
      [ContractType.ERC20]: erc20Abi,
      [ContractType.LenderGroups]: contracts[ContractType.LenderGroups]?.abi,
    }),
    [chainId, contractName, contracts]
  );
  const address =
    contractType === ContractType.Teller
      ? contracts[contractName ?? ""]?.address
      : externalContracts[chainId]["contracts"][contractName ?? ""]?.address ||
        contractName;
  const { data, error, isLoading, refetch, isRefetching, isFetched } =
    useWagmiReadContract({
      address,
      abi: mapAbi[contractType],
      functionName,
      args,
      chainId: chainId,
      query: {
        enabled: !skipRun,
      },
    });

  return useMemo(() => {
    return {
      data: data as T | undefined,
      error,
      isLoading,
      refetch,
      isRefetching,
      isFetched,
    };
  }, [data, error, isLoading, refetch, isRefetching, isFetched]);
};
