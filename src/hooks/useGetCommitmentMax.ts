import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import { bigIntMin } from "../helpers/bigIntMath";
import { parseBigInt } from "../helpers/parseBigInt";
import { CommitmentCollateralType } from "../types/poolsApiTypes";

import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { useContracts } from "./useContracts";
import { useGetMaxPrincipalPerCollateralFromLCFAlpha } from "./useGetMaxPrincipalPerCollateralFromLCFAlpha";
import { useGetMaxPrincipalPerCollateralLenderGroup } from "./useGetMaxPrincipalPerCollateralLenderGroup";
import { useGetProtocolFee } from "./useGetProtocolFee";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "./useReadContract";
import { useRequiredCollateral } from "./useRequiredCollateral";

interface Result {
  maxLoanAmount: bigint;
  maxCollateral: bigint;
  displayedPrincipal: bigint;
  isLoading: boolean;
  maxLoanAmountNumber: number;
}

interface Args {
  commitment?: CommitmentType;
  requestedCollateral?: bigint;
  isRollover?: boolean;
  collateralTokenDecimals?: number;
  returnCalculatedLoanAmount?: boolean;
  loanAmount?: bigint;
  isSameLender?: boolean;
}

export const useGetCommitmentMax = ({
  commitment,
  requestedCollateral,
  collateralTokenDecimals,
  isRollover,
  returnCalculatedLoanAmount,
  loanAmount,
  isSameLender,
}: Args): Result => {
  const isLenderGroup = commitment?.isLenderGroup;
  const availableLenderBalance = useBalance({
    token: commitment?.principalTokenAddress,
    address: commitment?.lenderAddress,
  });

  const { data: principalAmountAvailableToBorrow } = useReadContract<bigint>(
    commitment?.lenderAddress ?? "0x",
    "getPrincipalAmountAvailableToBorrow",
    [],
    !isLenderGroup,
    commitment?.isV2 ? ContractType.LenderGroupsV2 : ContractType.LenderGroups
  );

  let lenderGroupAmount = principalAmountAvailableToBorrow ?? 0n;
  if (isSameLender) {
    lenderGroupAmount = lenderGroupAmount + BigInt(loanAmount ?? 0);
  }

  const contracts = useContracts();

  const { address } = useAccount();

  const { protocolFeePercent } = useGetProtocolFee();
  const marketplaceFee = +(commitment?.marketplace?.marketplaceFeePercent ?? 0);
  const { referralFee } = useGetGlobalPropsContext();

  const totalFeePercent =
    10000 - ((protocolFeePercent ?? 0) + marketplaceFee + (referralFee ?? 0));

  const availableLenderAllowance = useReadContract(
    commitment?.principalTokenAddress,
    "allowance",
    [commitment?.lenderAddress, contracts?.TellerV2?.address],
    false,
    ContractType.ERC20
  );

  const { maxPrincipalPerCollateral, isCommitmentFromLCFAlpha } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);

  const maxPrincipalPerCollateralLenderGroup =
    useGetMaxPrincipalPerCollateralLenderGroup(commitment);
  const minAmount = useMemo(() => {
    return isLenderGroup
      ? lenderGroupAmount
      : bigIntMin(
          parseBigInt(availableLenderBalance?.data?.value ?? 0) +
            parseBigInt(loanAmount ?? 0),
          parseBigInt(availableLenderAllowance?.data ?? 0),
          parseBigInt(commitment?.committedAmount ?? 0) +
            BigInt(loanAmount ?? 0)
        );
  }, [
    availableLenderAllowance?.data,
    availableLenderBalance?.data?.value,
    commitment?.committedAmount,
    isLenderGroup,
    lenderGroupAmount,
    loanAmount,
  ]);

  const { data: principalTokenDecimals } = useReadContract(
    commitment?.principalTokenAddress,
    "decimals",
    [],
    false,
    ContractType.ERC20
  );

  const collateralType: string | undefined = commitment?.collateralToken?.type;

  const { data: colBal } = useBalance({
    address,
    token: /* isNative ? undefined :  */ commitment?.collateralToken?.address,
  });

  // TODO: Improve this conditional so isRollover and requestedCollateral are not coupled
  // const collateralBalance =
  //   isRollover && requestedCollateral
  //     ? requestedCollateral
  //     : colBal?.value ?? BigInt(0);

  const collateralBalance =
    isRollover && requestedCollateral
      ? requestedCollateral
      : colBal?.value
      ? BigInt(colBal.value)
      : 0n;

  const { requiredCollateral = BigInt(0), isLoading } = useRequiredCollateral({
    commitment: commitment as CommitmentType,
    principalAmount: minAmount,
    maxPrincipalPerCollateral,
    maxPrincipalPerCollateralLenderGroup,
    isCommitmentFromLCFAlpha,
    isRollover,
  });

  const maxCollateral = useMemo(() => {
    const amount =
      (requiredCollateral ?? 0n) > collateralBalance
        ? collateralBalance
        : requiredCollateral;
    return amount;
  }, [collateralBalance, /* isNative, */ requiredCollateral]);

  const collateralAmount = BigInt(requestedCollateral ?? collateralBalance);

  const maxLoanAmount = useMemo(() => {
    if (
      collateralTokenDecimals === undefined ||
      collateralTokenDecimals === null ||
      principalTokenDecimals === undefined ||
      principalTokenDecimals === null
    )
      return BigInt(0);
    const calculatedAmount =
      (collateralAmount *
        parseBigInt(
          isLenderGroup
            ? maxPrincipalPerCollateralLenderGroup
            : maxPrincipalPerCollateral ?? 0
        )) /
      BigInt(
        Math.pow(
          10,
          isCommitmentFromLCFAlpha || isLenderGroup
            ? 18
            : principalTokenDecimals + +collateralTokenDecimals
        )
      );

    const maxPrincipal = parseBigInt(minAmount ?? 0);

    const loanAmount =
      !returnCalculatedLoanAmount && calculatedAmount > maxPrincipal
        ? maxPrincipal
        : calculatedAmount;

    return parseBigInt((loanAmount * BigInt(9_990)) / BigInt(10_000));
  }, [
    collateralAmount,
    collateralTokenDecimals,
    isCommitmentFromLCFAlpha,
    isLenderGroup,
    maxPrincipalPerCollateral,
    maxPrincipalPerCollateralLenderGroup,
    minAmount,
    principalTokenDecimals,
    returnCalculatedLoanAmount,
  ]);

  const maxLoanAmountNumber = Number(
    formatUnits(maxLoanAmount, commitment?.principalToken?.decimals ?? 18)
  );

  let displayedPrincipal = maxLoanAmount;
  if (minAmount < parseBigInt(commitment?.committedAmount ?? 0)) {
    displayedPrincipal =
      (parseBigInt(maxLoanAmount) * parseBigInt(totalFeePercent)) /
      BigInt(10000);
  }

  return useMemo(
    () => ({
      maxLoanAmount,
      maxLoanAmountNumber,
      displayedPrincipal,
      maxCollateral,
      isLoading,
    }),
    [
      maxLoanAmount,
      maxLoanAmountNumber,
      displayedPrincipal,
      maxCollateral,
      isLoading,
    ]
  );
};
