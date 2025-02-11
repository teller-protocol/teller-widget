import { useMemo } from "react";
import { erc20Abi } from "viem";
import {
  useSimulateContract,
  useWriteContract as useWagmiWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import externalContracts from "../constants/externalContracts";
import { useChainId } from "wagmi";

import { useContracts } from "./useContracts";

export enum ContractType {
  Teller = "Teller",
  ERC20 = "ERC20",
  External = "External",
  LenderGroups = "LenderCommitmentGroupBeacon",
}

interface UseWriteContractArgs {
  contractType?: ContractType;
  functionName?: string;
  args?: any[];
  contractName: string;
  skip?: boolean;
  onTransactionReceipt?: (data: any) => void;
}

export const useWriteContract = ({
  contractType = ContractType.Teller,
  functionName,
  args,
  contractName,
  skip,
}: UseWriteContractArgs) => {
  const contracts = useContracts();
  const chainId = useChainId();
  const mapContractTypeToAbi = {
    [ContractType.Teller]: contracts[contractName]?.abi,
    [ContractType.External]:
      externalContracts[chainId]["contracts"][contractName]?.abi,
    [ContractType.ERC20]: erc20Abi,
    [ContractType.LenderGroups]: contracts[ContractType.LenderGroups]?.abi,
  };

  const abi = mapContractTypeToAbi[contractType];
  const isTellerContract = contractType === ContractType.Teller;
  const contractAddress = isTellerContract
    ? contracts[contractName ?? ""]?.address
    : externalContracts[chainId]["contracts"][contractName ?? ""]?.address ||
      contractName;

  const {
    data: simulatedData,
    error: simulatedError,
    isLoading: isSimulationLoading,
  } = useSimulateContract({
    abi,
    address: contractAddress,
    functionName,
    args,
    query: {
      enabled: !skip,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const {
    writeContract,
    data,
    error: writeError,
    isPending,
  } = useWagmiWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: successData,
  } = useWaitForTransactionReceipt({
    hash: data,
  });

  const error = simulatedError || writeError;

  return useMemo(
    () => ({
      writeContract,
      data,
      error,
      isConfirmed,
      successData,
      simulatedData,
      isSimulationLoading,
      isPending,
      isConfirming,
      simulatedError,
      writeError,
    }),
    [
      writeContract,
      data,
      error,
      isConfirmed,
      successData,
      simulatedData,
      isSimulationLoading,
      isPending,
      isConfirming,
      simulatedError,
      writeError,
    ]
  );
};
