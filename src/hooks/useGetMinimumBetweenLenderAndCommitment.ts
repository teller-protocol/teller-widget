import { useCallback } from "react";
import { Address, erc20Abi } from "viem";
import { useChainId } from "wagmi";
import { getBalance, readContract } from "wagmi/actions";
import { bigIntMin } from "../helpers/bigIntMath";
import { config } from "../helpers/createWagmiConfig";
import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { useContracts } from "./useContracts";
import { ChainNumbers } from "../types/chainTypes";

export const useGetMinimumBetweenLenderAndCommitment = () => {
  const chainId = useChainId();
  const contracts = useContracts();

  const getMinimumBalance = useCallback(
    async (commitment: CommitmentType) => {
      const principalTokenAddress = commitment?.principalToken?.address;
      const lenderAddress = commitment?.lenderAddress;

      if (!principalTokenAddress || !lenderAddress) return BigInt(0);
      const availableLenderBalance = await getBalance(config, {
        token: principalTokenAddress,
        address: lenderAddress,
      });

      const availableLenderAllowance = await readContract(config, {
        address: principalTokenAddress,
        functionName: "allowance",
        abi: erc20Abi,
        args: [lenderAddress, contracts?.TellerV2?.address],
        chainId: chainId as ChainNumbers,
      });

      const minAmount = bigIntMin(
        BigInt(availableLenderBalance?.value ?? 0),
        BigInt(availableLenderAllowance ?? 0),
        BigInt(commitment?.committedAmount ?? 0)
      );

      return minAmount;
    },
    [chainId, contracts]
  );

  return { getMinimumBalance };
};
