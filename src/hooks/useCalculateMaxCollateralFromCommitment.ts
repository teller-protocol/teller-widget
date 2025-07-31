import { useContracts } from "./useContracts";

import { useCallback } from "react";

import { CommitmentType } from "./queries/useGetRolloverableCommitments";

import { readContract } from "wagmi/actions";
import { config } from "../helpers/createWagmiConfig";
import { useChainId } from "wagmi";
import { ContractType, SupportedContractsEnum } from "./useReadContract";
import { useLenderGroupsContractType } from "./useLenderGroupsContractType";

export const useCalculateMaxCollateralFromCommitment = () => {
  const contracts = useContracts();
  const contractType = useLenderGroupsContractType();
  const chainId = useChainId() as
    | 1
    | 10
    | 137
    | 42161
    | 8453
    | 11155111
    | 59144
    | 81457
    | 5000
    | 169
    | 34443
    | undefined;
  const lenderGroupContract = contracts[contractType].abi;

  const calculateMaxCollateralFromLenderGroup = useCallback(
    async (
      commitment: CommitmentType,
      isSameLender?: boolean,
      loanAmount?: bigint
    ) => {
      const poolOracleRoute1 = await readContract(config, {
        address: commitment?.lenderAddress ?? "0x",
        functionName: "poolOracleRoutes",
        abi: lenderGroupContract,
        args: [0],
        chainId,
      }).catch((error) => {
        console.error("error with poolOracleRoute1", error);
        return undefined;
      });

      const poolOracleRoute2 = await readContract(config, {
        address: commitment?.lenderAddress ?? "0x",
        functionName: "poolOracleRoutes",
        abi: lenderGroupContract,
        args: [1],
        chainId,
      }).catch((error) => {
        console.error("error with poolOracleRoute2", error);
        return undefined;
      });

      const maxPrincipalPerCollateralLenderGroup = await readContract(config, {
        address: commitment?.lenderAddress ?? "0x",
        functionName: "getUniswapPriceRatioForPoolRoutes",
        abi: lenderGroupContract,
        args: [
          [poolOracleRoute1, ...(poolOracleRoute2 ? [poolOracleRoute2] : [])],
        ],
        chainId,
      }).catch((error) => {
        console.error("error with maxPrincipalPerCollateralLenderGroup", error);
      });

      const availableToBorrow = await readContract(config, {
        address: commitment?.lenderAddress ?? "0x",
        functionName: "getPrincipalAmountAvailableToBorrow",
        abi: lenderGroupContract,
        args: [],
        chainId,
      }).catch((error) => {
        console.error("error with availableToBorrow", error);
      });

      const ajustedMaxPrincipalPerCollateralLenderGroup =
        maxPrincipalPerCollateralLenderGroup
          ? (BigInt(maxPrincipalPerCollateralLenderGroup.toString()) *
              BigInt(10000)) /
            BigInt(commitment?.collateralRatio ?? 1)
          : BigInt(0);

      let lenderGroupAvailableToBorrow = BigInt(
        (availableToBorrow ?? 0).toString()
      );
      if (isSameLender) {
        lenderGroupAvailableToBorrow =
          lenderGroupAvailableToBorrow + BigInt((loanAmount ?? 0).toString());
      }

      const requiredCollateral = await readContract(config, {
        address: commitment?.lenderAddress ?? "0x",
        functionName: "getRequiredCollateral",
        abi: lenderGroupContract,
        args: [
          lenderGroupAvailableToBorrow,
          ajustedMaxPrincipalPerCollateralLenderGroup,
        ],
        chainId,
      }).catch((error) => {
        console.error("error with requiredCollateral", error);
      });

      return requiredCollateral;
    },
    [chainId, lenderGroupContract]
  );

  const calculateMaxCollateralFromCommitment = (commitment: CommitmentType) => {
    const availablePrincipal =
      BigInt(commitment?.maxPrincipal?.toString() ?? 0) -
      BigInt(commitment?.acceptedPrincipal?.toString() ?? 0);

    const expansionFactor = BigInt(10 ** 18);

    const maxCollateral =
      (availablePrincipal * expansionFactor) /
      BigInt(commitment?.maxPrincipalPerCollateralAmount?.toString() ?? 1);

    return maxCollateral;
  };

  const calculateMaxPrincipalPerCollateralFromLCFAlpha = useCallback(
    async (commitment: CommitmentType) => {
      const availablePrincipal =
        BigInt(commitment?.maxPrincipal?.toString() ?? 0) -
        BigInt(commitment?.acceptedPrincipal?.toString() ?? 0);

      const expansionFactor = BigInt(10 ** 18);
      const forwarderAddress = commitment?.forwarderAddress;

      const lcfContract =
        contracts[SupportedContractsEnum.LenderCommitmentForwarderAlpha].abi;

      const commitmentRoutes = (await readContract(config, {
        address: forwarderAddress as `0x${string}`,
        functionName: "getAllCommitmentUniswapPoolRoutes",
        abi: lcfContract,
        args: [commitment?.id],
        chainId,
      }).catch((error) => {
        console.error("error with commitmentRoutes", error);
        return [];
      })) as any[];

      const priceRatioResult = await readContract(config, {
        address: forwarderAddress as `0x${string}`,
        functionName: "getUniswapPriceRatioForPoolRoutes",
        abi: lcfContract,
        args: [commitmentRoutes],
        chainId,
      }).catch((error) => {
        console.error("error with priceRatio", error);
        return "0";
      });

      const ltvRatioResult = await readContract(config, {
        address: forwarderAddress as `0x${string}`,
        functionName: "getCommitmentPoolOracleLtvRatio",
        abi: lcfContract,
        args: [commitment?.id],
        chainId,
      }).catch((error) => {
        console.error("error with ltvRatio", error);
        return "0";
      });

      if (!commitment?.id || !priceRatioResult || !ltvRatioResult) {
        return BigInt(
          commitment?.maxPrincipalPerCollateralAmount?.toString() ?? 0
        );
      }

      const newMaxPrincipalPerCollateral =
        (BigInt(priceRatioResult.toString()) *
          BigInt(ltvRatioResult.toString())) /
        BigInt(10000);

      return (
        (availablePrincipal / newMaxPrincipalPerCollateral) * expansionFactor
      );
    },
    [chainId, contracts]
  );

  const calculateMaxCollateral = (
    commitment: CommitmentType,
    isSameLender?: boolean,
    loanAmount?: bigint
  ) => {
    if (commitment?.isLenderGroup) {
      return calculateMaxCollateralFromLenderGroup(
        commitment,
        isSameLender,
        loanAmount
      );
    } else {
      const result = calculateMaxPrincipalPerCollateralFromLCFAlpha(commitment);
      return result;
    }
  };

  return {
    calculateMaxCollateral,
  };
};
