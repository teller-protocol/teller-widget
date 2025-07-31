import { useChainId } from "wagmi";
import { optimism } from "viem/chains";
import { ContractType } from "./useReadContract";

export const useLenderGroupsContractType = () => {
  const chainId = useChainId();
  const isOptimism = chainId === optimism.id;
  return isOptimism ? ContractType.LenderGroupsV2 : ContractType.LenderGroups;
};
