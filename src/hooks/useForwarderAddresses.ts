import { useContracts } from "./useContracts";
import { SupportedContractsEnum } from "./useReadContract";

export const useForwarderAddresses = () => {
  const contracts = useContracts();

  const lcfAlphaAddress = contracts?.[
    SupportedContractsEnum.LenderCommitmentForwarderAlpha
  ]?.address as string;
  const lcfAddress = contracts?.[
    SupportedContractsEnum.LenderCommitmentForwarder
  ]?.address as string;

  return { lcfAlphaAddress, lcfAddress };
};
