import { useEffect, useMemo } from "react";
import { erc20Abi } from "viem";
import {
  useSimulateContract,
  useWriteContract as useWagmiWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { useContracts } from "./useContracts";

export enum ContractType {
  Teller = "Teller",
  ERC20 = "ERC20",
}

interface UseWriteContractArgs {
  contractType?: ContractType;
  functionName: string;
  args?: any[];
  contractName?: string;
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
  const mapContractTypeToAbi = {
    [ContractType.Teller]: contracts[contractName]?.abi,
    [ContractType.ERC20]: erc20Abi,
  };

  const abi = mapContractTypeToAbi[contractType];
  const isTellerContract = contractType === ContractType.Teller;

  const contractAddress = isTellerContract
    ? contracts[contractName]?.address
    : contractName;

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
      retry: true,
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

  const isError = simulatedError || writeError;
  const error = simulatedError || writeError;

  return useMemo(
    () => ({
      writeContract,
      data,
      error,
      isConfirmed,
      successData,
      isError,
      simulatedData,
      isSimulationLoading,
      isPending,
      isConfirming,
    }),
    [
      writeContract,
      data,
      error,
      isConfirmed,
      successData,
      isError,
      simulatedData,
      isSimulationLoading,
      isPending,
      isConfirming,
    ]
  );
};
