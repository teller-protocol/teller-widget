import { bigIntMin } from "../helpers/bigIntMath";
import { useMemo } from "react";
import { Address } from "viem";
import { useBalance } from "wagmi";
import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { ContractType, useReadContract } from "./useReadContract";

export const useLenderGroupCommitmentMax = ({
  lenderGroupCommitment,
  collateralAmount,
  skip,
}: {
  lenderGroupCommitment?: CommitmentType;
  collateralAmount?: bigint;
  skip?: boolean;
}) => {
  const poolId = lenderGroupCommitment?.lenderAddress;
  const collateralAddress = lenderGroupCommitment?.collateralToken?.address;

  const { data: maxLoanAmount } = useReadContract(
    poolId as Address,
    "getPrincipalAmountAvailableToBorrow",
    [],
    skip,
    ContractType.LenderGroups
  );

  const { data: requiredCollateralFor1PrincipalAmount } = useReadContract(
    poolId as Address,
    "calculateCollateralRequiredToBorrowPrincipal",
    [BigInt(1)],
    false,
    ContractType.LenderGroups
  );

  const requiredPrincipalAmount = useMemo(() => {
    if (!requiredCollateralFor1PrincipalAmount) return 0;
    return (
      BigInt(collateralAmount ?? 0) / requiredCollateralFor1PrincipalAmount
    );
  }, [collateralAmount, requiredCollateralFor1PrincipalAmount]);

  const { data: maxAvailableCollateral } = useReadContract(
    poolId as Address,
    "calculateCollateralRequiredToBorrowPrincipal",
    [maxLoanAmount],
    !maxLoanAmount || skip,
    ContractType.LenderGroups
  );

  const { data: collateralWalletBalance } = useBalance({
    token: collateralAddress,
  });
  const maxCollateral = bigIntMin(
    collateralWalletBalance?.value ?? BigInt(0),
    maxAvailableCollateral ?? BigInt(0)
  );

  return {
    maxCollateral,
    maxLoanAmount:
      requiredPrincipalAmount > 0n ? requiredPrincipalAmount : maxLoanAmount,
    displayedPrincipal: maxLoanAmount,
  };
};
