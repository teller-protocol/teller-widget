import { useMemo } from "react";
import { Address, erc20Abi } from "viem";
import uniswapV3PoolAbi from "../contracts/UNISWAP_V3_POOL_ABI.json";
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
  "LenderGroupsV2" = "LenderCommitmentGroupBeaconV2",
  "SmartCommitmentForwarder" = "SmartCommitmentForwarder",
  "BorrowSwap" = "BorrowSwap",
  "SwapRolloverLoan" = "SwapRolloverLoan",
  "UniswapPricingHelper" = "UniswapPricingHelper",
}

export enum ContractType {
  Teller = "Teller",
  ERC20 = "ERC20",
  UNIV3POOL = "UNIV3POOL",
  External = "External",
  LenderGroups = "LenderCommitmentGroupBeacon",
  LenderGroupsV2 = "LenderCommitmentGroupBeaconV2",
  UniswapPricingHelper = "UniswapPricingHelper",
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
      [ContractType.UNIV3POOL]: uniswapV3PoolAbi,
      [ContractType.LenderGroups]: contracts[ContractType.LenderGroups]?.abi,
      [ContractType.LenderGroupsV2]:
        contracts[ContractType.LenderGroupsV2]?.abi,
      [ContractType.UniswapPricingHelper]:
        contracts[ContractType.UniswapPricingHelper]?.abi,
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
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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
