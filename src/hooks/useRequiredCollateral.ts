import { useMemo } from "react";
import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { CommitmentCollateralType } from "../types/poolsApiTypes";
import { SupportedContractsEnum, useReadContract } from "./useReadContract";
import { calculateLenderGroupRequiredCollateral } from "../helpers/getRequiredCollateral";

interface UseRequiredCollateralArgs {
  commitment: CommitmentType;
  principalAmount?: bigint;
  maxPrincipalPerCollateral?: string | bigint | undefined;
  maxPrincipalPerCollateralLenderGroup?: string | bigint | undefined;
  isCommitmentFromLCFAlpha?: boolean;
  isRollover?: boolean;
}

interface UseRequiredCollateralResult {
  requiredCollateral: bigint;
  isLoading: boolean;
}

export const useRequiredCollateral = ({
  commitment,
  principalAmount,
  maxPrincipalPerCollateral,
  maxPrincipalPerCollateralLenderGroup,
  isCommitmentFromLCFAlpha = false,
  isRollover = false,
}: UseRequiredCollateralArgs): UseRequiredCollateralResult => {
  const isLenderGroup = commitment?.isLenderGroup;

  const contractArgs = useMemo(() => {
    if (isLenderGroup) return [];

    return [
      principalAmount,
      maxPrincipalPerCollateral ?? 0n,
      CommitmentCollateralType[
        commitment?.collateralToken
          ?.type as keyof typeof CommitmentCollateralType
      ],
      ...(isCommitmentFromLCFAlpha
        ? []
        : [
            commitment?.collateralToken?.address,
            commitment?.principalTokenAddress,
          ]),
    ];
  }, [
    isLenderGroup,
    principalAmount,
    maxPrincipalPerCollateral,
    commitment?.collateralToken?.type,
    commitment?.collateralToken?.address,
    commitment?.principalTokenAddress,
    isCommitmentFromLCFAlpha,
  ]);

  const forwarderAddress = useMemo(() => {
    if (isLenderGroup) return "0x";

    if (isCommitmentFromLCFAlpha) {
      return SupportedContractsEnum.LenderCommitmentForwarderAlpha;
    }

    if (isRollover) {
      return SupportedContractsEnum.LenderCommitmentForwarderStaging;
    }

    return SupportedContractsEnum.LenderCommitmentForwarder;
  }, [isLenderGroup, isCommitmentFromLCFAlpha, isRollover]);

  const { data: requiredCollateralContract = 0n, isLoading: contractLoading } =
    useReadContract<bigint>(
      forwarderAddress,
      "getRequiredCollateral",
      contractArgs,
      isLenderGroup ? false : contractArgs.some((arg) => !arg), // Skip loading for LenderGroup
    );

  const requiredCollateral = useMemo(() => {
    if (isLenderGroup) {
      return calculateLenderGroupRequiredCollateral(
        principalAmount,
        maxPrincipalPerCollateralLenderGroup ?? 0n
      );
    }

    return requiredCollateralContract;
  }, [
    isLenderGroup,
    principalAmount,
    maxPrincipalPerCollateralLenderGroup,
    requiredCollateralContract,
  ]);

  const isLoading = isLenderGroup ? false : contractLoading;

  return {
    requiredCollateral,
    isLoading,
  };
};
