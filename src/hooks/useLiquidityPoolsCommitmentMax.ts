import { formatUnits, parseUnits } from "viem";
import { AddressStringType } from "../types/addressStringType";
import { CommitmentType } from "./queries/useGetRolloverableCommitments";
import { ContractType, useReadContract } from "./useReadContract";
import { useMemo } from "react";
import { bigIntMin } from "../helpers/bigIntMath";
import { useAccount, useToken, useBalance } from "wagmi";
export const useLiquidityPoolsCommitmentMax = ({
  lenderGroupCommitment,
  collateralAmount,
  skip,
}: {
  lenderGroupCommitment?: CommitmentType;
  collateralAmount?: bigint;
  skip?: boolean;
}) => {
  const { address } = useAccount();
  const poolId = lenderGroupCommitment?.lenderAddress;
  const collateralAddress = lenderGroupCommitment?.collateralToken?.address;
  const principalAddress = lenderGroupCommitment?.principalToken?.address;

  const { data: principalTokenData } = useToken({
    address: principalAddress,
  });

  const { data: maxLoanAmountFromContract } = useReadContract(
    poolId as AddressStringType,
    "getPrincipalAmountAvailableToBorrow",
    [],
    skip,
    ContractType.LenderGroups
  );

  const { data: requiredCollateralFor1PrincipalAmount } = useReadContract(
    poolId as AddressStringType,
    "calculateCollateralRequiredToBorrowPrincipal",
    [parseUnits("1", principalTokenData?.decimals)],
    skip,
    ContractType.LenderGroups
  );

  const { data: maxAvailableCollateralInPool } = useReadContract(
    poolId,
    "calculateCollateralRequiredToBorrowPrincipal",
    [maxLoanAmountFromContract],
    !maxLoanAmountFromContract,
    ContractType.LenderGroups // Setting the contractType to LenderGroups
  );

  const standardExpansionFactorExponent = 18;
  const principalTokenDecimals = principalTokenData?.decimals ?? 0;

  //if principal token is USDC,  this would be 24
  const principalTokenExpansionFactorExponent =
    standardExpansionFactorExponent + principalTokenDecimals;

  const principalTokenExpansionFactor = BigInt(
    10 ** principalTokenExpansionFactorExponent
  );

  const standardExpansionFactor = BigInt(10 ** standardExpansionFactorExponent);

  /*
    requiredCollateralFor1PrincipalAmount is from a call to calculateCollateralRequiredToBorrowPrincipal
    where the input is   1^( decimals of the principal token )
    ex) if you put in 1 human unit of USDC  , requiredCollateralFor1PrincipalAmount will be
    ex)  1000000  Raw units of USDC ,   requiredCollateralFor1PrincipalAmount  is 108443677787806812 raw units of DMT

    requiredCollateralFor1PrincipalAmount ->   raw units of the collateral token   expanded by  (10^ decimals of the collateral token)
    ****  WITH RESPECT TO raw units of the principal token unexpanded

    */

  // this is finding the inverse ratio
  // now requiredPrincipalAmount  is more cleanly just the principal amount in raw units -> (  the human value expanded by the principal token decimals )
  const requiredPrincipalAmount = useMemo(() => {
    if (
      !requiredCollateralFor1PrincipalAmount ||
      requiredCollateralFor1PrincipalAmount === 0n
    )
      return 0;
    return (
      ((collateralAmount ?? 0n) * principalTokenExpansionFactor) / //  this muldiv represents the inverse ratio , 1 principal amount / required collateral
      (requiredCollateralFor1PrincipalAmount ?? 1n) /
      standardExpansionFactor
    );
  }, [
    collateralAmount,
    principalTokenExpansionFactor,
    requiredCollateralFor1PrincipalAmount,
    standardExpansionFactor,
  ]);

  const { data: maxAvailableCollateral } = useReadContract(
    poolId as AddressStringType,
    "calculateCollateralRequiredToBorrowPrincipal",
    [maxLoanAmountFromContract],
    !maxLoanAmountFromContract || skip,
    ContractType.LenderGroups
  );

  const { data: collateralWalletBalance } = useBalance({
    token: collateralAddress,
    address,
  });
  const maxCollateral = bigIntMin(
    collateralWalletBalance?.value ?? BigInt(0),
    maxAvailableCollateral ?? BigInt(0)
  );

  const maxLoanAmount =
    requiredPrincipalAmount > 0
      ? requiredPrincipalAmount
      : maxLoanAmountFromContract;

  const maxLoanAmountNumber = Number(
    formatUnits(maxLoanAmount ?? 0n, principalTokenData?.decimals ?? 18)
  );

  const maxLoanAmountWithBuffer =
    ((maxLoanAmount ?? 0n) * BigInt(99)) / BigInt(100);

  return {
    maxCollateral,
    maxLoanAmount: maxLoanAmountWithBuffer,
    displayedPrincipal: maxLoanAmountWithBuffer,
    maxLoanAmountNumber,
    maxAvailableCollateralInPool,
  };
};
