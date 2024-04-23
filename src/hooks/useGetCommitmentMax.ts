import { useMemo } from "react";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import { bigIntMin } from "../helpers/bigIntMath";
import { CommitmentCollateralType } from "../types/poolsApiTypes";

import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { useContracts } from "./useContracts";
import { useGetMaxPrincipalPerCollateralFromLCFAlpha } from "./useGetMaxPrincipalPerCollateralFromLCFAlpha";
import { useGetProtocolFee } from "./useGetProtocolFee";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "./useReadContract";

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
}

export const useCommitmentMax = ({
  commitment,
  requestedCollateral,
  collateralTokenDecimals,
  isRollover,
  returnCalculatedLoanAmount,
}: Args): Result => {
  const availableLenderBalance = useBalance({
    token: commitment?.principalTokenAddress,
    address: commitment?.lenderAddress,
  });

  const contracts = useContracts();

  const { address } = useAccount();

  const { protocolFeePercent } = useGetProtocolFee();
  const marketplaceFee = +(commitment?.marketplace?.marketplaceFeePercent ?? 0);

  const totalFeePercent = 10000 - ((protocolFeePercent ?? 0) + marketplaceFee);

  const availableLenderAllowance = useReadContract(
    commitment?.principalTokenAddress,
    "allowance",
    [commitment?.lenderAddress, contracts?.TellerV2?.address],
    false,
    ContractType.ERC20
  );

  const { maxPrincipalPerCollateral, isCommitmentFromLCFAlpha } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);
  const minAmount = useMemo(
    () =>
      bigIntMin(
        BigInt(availableLenderBalance?.data?.value ?? 0),
        BigInt(availableLenderAllowance?.data ?? 0),
        BigInt(commitment?.committedAmount ?? 0)
      ),
    [
      availableLenderAllowance?.data,
      availableLenderBalance?.data?.value,
      commitment?.committedAmount,
    ]
  );

  const { data: principalTokenDecimals } = useReadContract({
    address: commitment?.principalTokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const collateralType: string | undefined = commitment?.collateralToken?.type;

  const { data: colBal } = useBalance({
    address,
    token: /* isNative ? undefined :  */ commitment?.collateralToken?.address,
    enabled: !isRollover,
  });

  // TODO: Improve this conditional so isRollover and requestedCollateral are not coupled
  // const collateralBalance =
  //   isRollover && requestedCollateral
  //     ? requestedCollateral
  //     : colBal?.value ?? BigInt(0);

  const collateralBalance = requestedCollateral
    ? requestedCollateral
    : colBal?.value ?? BigInt(0);

  const requiredCollateralArgs = [
    minAmount,
    maxPrincipalPerCollateral,
    CommitmentCollateralType[
      collateralType as keyof typeof CommitmentCollateralType
    ],
    ...(isCommitmentFromLCFAlpha
      ? []
      : [
          commitment?.collateralToken?.address,
          commitment?.principalTokenAddress,
        ]),
  ];
  const { data: requiredCollateral = BigInt(0), isLoading } =
    useReadContract<bigint>(
      isCommitmentFromLCFAlpha
        ? SupportedContractsEnum.LenderCommitmentForwarderAlpha
        : isRollover
        ? SupportedContractsEnum.LenderCommitmentForwarderStaging
        : SupportedContractsEnum.LenderCommitmentForwarder,
      "getRequiredCollateral",
      requiredCollateralArgs,
      requiredCollateralArgs.some((arg) => !arg)
    );

  const maxCollateral = useMemo(() => {
    const amount =
      (requiredCollateral ?? BigInt(0)) > collateralBalance
        ? BigInt(collateralBalance)
        : requiredCollateral;

    /*     if (isNative) {
      const minGas = parseUnits("10", "gwei").mul(1_500_000);
      const tenPercent = amount.mul(10).div(100);
      const amountToSubstract = tenPercent.gt(minGas) ? tenPercent : minGas;
      amount = amount.sub(amountToSubstract);
    } */
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
      (collateralAmount * BigInt(maxPrincipalPerCollateral ?? 0)) /
      BigInt(
        Math.pow(
          10,
          isCommitmentFromLCFAlpha
            ? 18
            : principalTokenDecimals + +collateralTokenDecimals
        )
      );

    const maxPrincipal = BigInt(minAmount ?? 0);

    return !returnCalculatedLoanAmount && calculatedAmount > maxPrincipal
      ? maxPrincipal
      : calculatedAmount;
  }, [
    collateralAmount,
    collateralTokenDecimals,
    isCommitmentFromLCFAlpha,
    maxPrincipalPerCollateral,
    minAmount,
    principalTokenDecimals,
  ]);

  const maxLoanAmountNumber = Number(
    formatUnits(maxLoanAmount, commitment?.principalToken?.decimals ?? 18)
  );

  let displayedPrincipal = maxLoanAmount;
  if (minAmount < BigInt(commitment?.committedAmount ?? 0)) {
    displayedPrincipal =
      (BigInt(maxLoanAmount) * BigInt(totalFeePercent)) / BigInt(10000);
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
