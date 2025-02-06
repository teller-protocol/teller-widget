/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAccount, useChainId } from "wagmi";
import { Loan } from "./queries/useGetActiveLoansForUser";
import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import { useGetMaxPrincipalPerCollateralFromLCFAlpha } from "./useGetMaxPrincipalPerCollateralFromLCFAlpha";
import { useContracts } from "./useContracts";
import { rfwAddressMap } from "../constants/rfwAddress";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "./useReadContract";
import { useCallback, useMemo, useState } from "react";
import { abs, bigIntMin } from "../helpers/bigIntMath";
import {
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "../pages/RepaySection/RepaySectionContext";
import { Address, zeroAddress } from "viem";
import { useCalculateMaxCollateralFromCommitment } from "./useCalculateMaxCollateralFromCommitment";
import { useGetMaxPrincipalPerCollateralLenderGroup } from "./useGetMaxPrincipalPerCollateralLenderGroup";
import { useGetProtocolFee } from "./useGetProtocolFee";

export const calculateCollateralRequiredForPrincipal = (
  loanPrincipal: bigint, // base units of the principal token
  maxPrincipalPerCollateralRatio: bigint, // ratio of max principal to collateral
  principalTokenDecimals: number,
  collateralTokenDecimals: number,
  isCommitmentFromLCFAlpha: boolean
): bigint => {
  if (isNaN(principalTokenDecimals))
    throw new Error("principalTokenDecimals must be a number");
  if (isNaN(collateralTokenDecimals))
    throw new Error("collateralTokenDecimals must be a number");

  const totalTokenDecimals = principalTokenDecimals + collateralTokenDecimals;

  const factor = 10 ** (isCommitmentFromLCFAlpha ? 18 : totalTokenDecimals); // 18 if lcf alpha, othewrwise previous code

  const expandedLoanPrincipal = BigInt(loanPrincipal) * BigInt(factor);

  // never want to divide by zero so we do this to avoid a panic
  if (BigInt(maxPrincipalPerCollateralRatio) === 0n) {
    return BigInt(0);
  }

  // since we are solving backwards, we need to use this trick to round properly
  const remainder =
    expandedLoanPrincipal % BigInt(maxPrincipalPerCollateralRatio);
  const roundUpCoefficient = remainder === 0n ? 0 : 1;

  return (
    expandedLoanPrincipal / BigInt(maxPrincipalPerCollateralRatio) +
    BigInt(roundUpCoefficient)
  );
};

export const calculatePrincipalReceivedPerCollateral = (
  collateralAmount: bigint,
  maxPrincipalPerCollateralRatio: bigint,
  principalTokenDecimals: number,
  collateralTokenDecimals: number,
  isCommitmentFromLCFAlpha: boolean = false
) => {
  if (isNaN(principalTokenDecimals))
    throw new Error("principalTokenDecimals must be a number");
  if (isNaN(collateralTokenDecimals))
    throw new Error("collateralTokenDecimals must be a number");

  const totalTokenDecimals = principalTokenDecimals + collateralTokenDecimals;

  const factor = 10 ** (isCommitmentFromLCFAlpha ? 18 : totalTokenDecimals);

  // const expandedCollateralAmount = BigNumber.from(collateralAmount).mul(factor)

  // never want to divide by zero so we do this to avoid a panic
  if (BigInt(maxPrincipalPerCollateralRatio) === 0n) {
    return BigInt(0);
  }

  return (
    (collateralAmount * BigInt(maxPrincipalPerCollateralRatio)) / BigInt(factor)
  );
};

const useRolloverLoan = (
  bid: Loan,
  rolloverCommitment: CommitmentType, // selected from the 'best' fitting commitment by Z Score
  maxCollateral: bigint,
  isInputMoreThanMaxCollateral?: boolean,
  maxLoanAmount?: bigint
) => {
  const { address: walletConnectedAddress } = useAccount();

  const principalAmount =
    (BigInt(maxLoanAmount ?? 0) * BigInt(99)) / BigInt(100);

  const isLenderGroup = rolloverCommitment?.isLenderGroup ?? false;

  const {
    setSuccessRolloverLoanHash,
    setCurrentStep,
    setSuccessfulRolloverParams,
    setRolloverCommitment,
  } = useGetRepaySectionContext();

  const {
    maxPrincipalPerCollateral: maxPrincipalPerCollateralLCFA,
    isCommitmentFromLCFAlpha,
    lcfAlphaAddress,
  } = useGetMaxPrincipalPerCollateralFromLCFAlpha(rolloverCommitment);

  const { data: minInterestRateLenderGroups } = useReadContract(
    rolloverCommitment?.lenderAddress,
    "getMinInterestRate",
    [principalAmount],
    false, // skipRun, assuming the default value here; change if needed
    ContractType.LenderGroups // Setting the contractType to LenderGroups
  );

  const maxPrincipalPerCollateralLenderGroups =
    useGetMaxPrincipalPerCollateralLenderGroup(rolloverCommitment);

  const maxPrincipalPerCollateral = isLenderGroup
    ? maxPrincipalPerCollateralLenderGroups
    : maxPrincipalPerCollateralLCFA;

  const contracts = useContracts();

  const commitmentForwarderAddress = isLenderGroup
    ? contracts?.[SupportedContractsEnum.SmartCommitmentForwarder]?.address
    : isCommitmentFromLCFAlpha
    ? lcfAlphaAddress
    : contracts?.[SupportedContractsEnum.LenderCommitmentForwarderStaging]
        ?.address;

  const smartCommitmentAddress = isLenderGroup
    ? rolloverCommitment.lenderAddress
    : zeroAddress;

  const lcfContractName = isCommitmentFromLCFAlpha
    ? SupportedContractsEnum.LenderCommitmentForwarderAlpha
    : SupportedContractsEnum.LenderCommitmentForwarderStaging;

  const extensionContract = isLenderGroup
    ? SupportedContractsEnum.SmartCommitmentForwarder
    : lcfContractName;

  const chainId = useChainId();

  const { referralFee, referralAddress } = useGetGlobalPropsContext();
  const referralFeeAmount =
    (BigInt(referralFee ?? 0) * BigInt(maxLoanAmount ?? 0)) / BigInt(10000);

  const { flashRolloverLoanContractData, flashRolloverLoanAddress } =
    useMemo(() => {
      const flashRolloverLoanContractData =
        contracts?.[SupportedContractsEnum.FlashRolloverLoanWidget];
      const flashRolloverLoanAddress = flashRolloverLoanContractData?.address;

      return { flashRolloverLoanContractData, flashRolloverLoanAddress };
    }, [contracts]);

  const { data: collateralManagerAddress } = useReadContract<string>(
    SupportedContractsEnum.TellerV2,
    "collateralManager",
    []
  );

  const collateral = bid.collateral[0];

  const tokenContractName = bid.lendingToken.address;
  const { data: flashRolloverAllowance } = useReadContract(
    tokenContractName,
    "allowance",
    [walletConnectedAddress, flashRolloverLoanAddress],
    false,
    ContractType.ERC20
  );

  const { data: collateralAllowance = 0n } = useReadContract(
    collateral?.collateralAddress,
    "allowance",
    [walletConnectedAddress, collateralManagerAddress],
    !collateral?.collateralAddress,
    ContractType.ERC20
  );

  const walletBalance = useReadContract(
    bid?.lendingTokenAddress,
    "balanceOf",
    [walletConnectedAddress],
    false,
    ContractType.ERC20
  );

  const hasApprovedForwarder = useReadContract<boolean>(
    SupportedContractsEnum.TellerV2,
    "hasApprovedMarketForwarder",
    [
      rolloverCommitment?.marketplaceId,
      commitmentForwarderAddress,
      walletConnectedAddress,
    ],
    !rolloverCommitment?.marketplaceId
  );

  const hasAddedExtension = useReadContract<boolean>(
    extensionContract,
    "hasExtension",
    [walletConnectedAddress, flashRolloverLoanAddress],
    !rolloverCommitment?.marketplaceId
  );

  const [cachedNow] = useState(+(Date.now() / 1000).toFixed());
  const future15Mins = useMemo(() => (900 + cachedNow).toFixed(), [cachedNow]);

  const principalTokenDecimals =
    rolloverCommitment?.principalToken?.decimals ?? 0;
  const collateralTokenDecimals =
    rolloverCommitment?.collateralToken?.decimals ?? 0;

  const maximumRolloverLoanPrincipalAmount = useMemo(() => {
    const collateralBalance = maxCollateral;

    if (!collateralBalance) {
      return bid.principal;
    }

    const maximumRolloverLoanPrincipalAmount =
      calculatePrincipalReceivedPerCollateral(
        BigInt(collateralBalance),
        BigInt(maxPrincipalPerCollateral ?? 0),
        principalTokenDecimals,
        collateralTokenDecimals,
        isCommitmentFromLCFAlpha
      );

    return bigIntMin(
      maximumRolloverLoanPrincipalAmount,
      BigInt(rolloverCommitment?.committedAmount ?? 0)
    );
  }, [
    maxCollateral,
    maxPrincipalPerCollateral,
    principalTokenDecimals,
    collateralTokenDecimals,
    isCommitmentFromLCFAlpha,
    rolloverCommitment?.committedAmount,
    bid.principal,
  ]); // use memo

  const rolloverLoanPrincipalAmount = BigInt(
    maximumRolloverLoanPrincipalAmount
  ).toString();

  // alternatively could just use the collateral that was in the original loan since it should match anyways
  const collateralAmount = calculateCollateralRequiredForPrincipal(
    BigInt(maxLoanAmount ?? 0),
    BigInt(maxPrincipalPerCollateral ?? 0),
    principalTokenDecimals,
    collateralTokenDecimals,
    isCommitmentFromLCFAlpha || isLenderGroup
    // TODO CHECK BUFFER
  );

  const acceptCommitmentArgs: any = useMemo(
    () => ({
      commitmentId: rolloverCommitment?.id,
      smartCommitmentAddress: smartCommitmentAddress,
      principalAmount: maxLoanAmount?.toString(),
      collateralAmount: collateralAmount.toString(),
      collateralTokenId: 0,
      collateralTokenAddress: rolloverCommitment?.collateralToken?.address,
      interestRate: isLenderGroup
        ? minInterestRateLenderGroups?.toString()
        : rolloverCommitment?.minAPY?.toString(),
      loanDuration: rolloverCommitment?.maxDuration?.toString(),
      merkleProof: [],
    }),
    [
      rolloverCommitment?.id,
      rolloverCommitment?.collateralToken?.address,
      rolloverCommitment?.minAPY,
      rolloverCommitment?.maxDuration,
      smartCommitmentAddress,
      maxLoanAmount,
      collateralAmount,
      isLenderGroup,
      minInterestRateLenderGroups,
    ]
  );

  const flashloanPremiumPct = 9; // for aave

  const { protocolFeePercent } = useGetProtocolFee();

  const {
    data: rolloverLoanEstimation,
    isLoading: calcRolloverIsLoading,
    error,
  } = useReadContract(
    SupportedContractsEnum.FlashRolloverLoanWidget,
    `calculateRolloverAmount`,
    [
      rolloverCommitment?.marketplace?.marketplaceFeePercent,
      protocolFeePercent,
      bid.bidId,
      principalAmount.toString(),
      referralFeeAmount.toString(),
      flashloanPremiumPct,
      future15Mins,
    ],
    false
  );

  const borrowerAmount =
    BigInt(rolloverLoanEstimation?.[1] ?? 0) < 0
      ? abs(BigInt(rolloverLoanEstimation[1] ?? 0))
      : 0n;

  const onSuccess = useCallback(
    (data: any, params: any) => {
      setSuccessRolloverLoanHash(data);
      setCurrentStep(RepaySectionSteps.ROLLOVER_CONFIRMATION);
      setSuccessfulRolloverParams(params);
      setRolloverCommitment(rolloverCommitment);
    },
    [
      rolloverCommitment,
      setCurrentStep,
      setRolloverCommitment,
      setSuccessRolloverLoanHash,
      setSuccessfulRolloverParams,
    ]
  );

  const transactions = useMemo(() => {
    let id = 0;
    const steps: any[] = [];
    if (calcRolloverIsLoading) return steps;

    /*
    if (
      !amount || !walletBalance?.value || !amountBN
    ) {
      return [
        {
          buttonLabel: 'Rollover'
        }
      ]
    }*/

    /* let errorMessage = amountBN.gt(walletBalance?.value)
      ? 'Insufficient funds.'
      : ''*/

    const errorMessage = "";

    /*

remember: need to grant allowance of WETH to the rollover contract
and need to grant allowance of the NFT(collateral) to collateralManager as well
*/

    // need to calc these values
    const loanId = bid.bidId;
    if (isInputMoreThanMaxCollateral) {
      steps.push({
        buttonLabel: "Insufficient collateral",
        isStepDisabled: true,
      });
    } else if (rolloverLoanEstimation) {
      const flashLoanAmount = rolloverLoanEstimation[0];

      const errorMessage =
        borrowerAmount &&
        walletBalance &&
        borrowerAmount > BigInt(walletBalance?.data)
          ? `Insufficient ${bid.lendingToken.symbol} balance.`
          : "";

      if (!hasApprovedForwarder.isLoading && !hasApprovedForwarder.data) {
        steps.push({
          buttonLabel: "Approve Teller",
          loadingButtonLabel: "Approving Teller...",
          contractName: SupportedContractsEnum.TellerV2,
          functionName: "approveMarketForwarder",
          args: [rolloverCommitment?.marketplaceId, commitmentForwarderAddress],
        });
        id++;
      }

      if (!hasAddedExtension.isLoading && !hasAddedExtension.data) {
        steps.push({
          buttonLabel: "Enable rollover",
          loadingButtonLabel: "Enabling rollover...",
          contractName: extensionContract,
          functionName: "addExtension",
          args: [flashRolloverLoanAddress],
        });
        id++;
      }

      if (borrowerAmount > BigInt(flashRolloverAllowance)) {
        steps.push({
          contractName: bid?.lendingTokenAddress,
          args: [flashRolloverLoanAddress, borrowerAmount * 10n],
          functionName: "approve",
          buttonLabel: `Approve ${bid.lendingToken.symbol}`,
          loadingButtonLabel: `Approving ${bid.lendingToken.symbol}...`,
          errorMessage,
          tooltip: `Permission is required to use funds to rollover loan`,
          id,
          contractType: ContractType.ERC20,
        });
        id++;
      }

      if (collateralAllowance < BigInt(collateralAmount)) {
        steps.push({
          contractName: rolloverCommitment?.collateralToken?.address,
          args: [collateralManagerAddress, BigInt(collateralAmount) * 10n],
          functionName: "approve",
          buttonLabel: `Approve collateral`,
          loadingButtonLabel: `Approving collateral...`,
          errorMessage,
          tooltip: `Permission is required to use funds to rollover loan`,
          id,
          contractType: ContractType.ERC20,
        });
        id++;
      }
      // -----

      const flashLoanReferralLimit =
        (flashLoanAmount * BigInt(9)) / BigInt(100);
      const referralFeeAmountToSend =
        referralFeeAmount < flashLoanReferralLimit
          ? referralFeeAmount
          : flashLoanReferralLimit;

      steps.push({
        contractName: SupportedContractsEnum.FlashRolloverLoanWidget,
        functionName: "rolloverLoanWithFlash",
        args: [
          rolloverCommitment?.forwarderAddress,
          loanId,
          flashLoanAmount,
          borrowerAmount,
          referralFeeAmountToSend, //_rewardAmount, must be less than 9% of flashLoanAmount
          referralAddress, //_rewardRecipient
          acceptCommitmentArgs,
        ],
        buttonLabel: `Rollover loan`,
        loadingButtonLabel: "Rolling over...",
        errorMessage,
        isStepDisabled: !!errorMessage,
        id,
        onSuccess,
      });
      id++;
    } else {
      console.log("WARN: no loan estimation");
      {
        error && console.error("Contract error", error);
      }
    }

    return steps;
  }, [
    calcRolloverIsLoading,
    bid.bidId,
    bid.lendingToken.symbol,
    bid?.lendingTokenAddress,
    isInputMoreThanMaxCollateral,
    rolloverLoanEstimation,
    borrowerAmount,
    walletBalance,
    hasApprovedForwarder.isLoading,
    hasApprovedForwarder.data,
    hasAddedExtension.isLoading,
    hasAddedExtension.data,
    flashRolloverAllowance,
    collateralAllowance,
    collateralAmount,
    referralFeeAmount,
    rolloverCommitment?.forwarderAddress,
    rolloverCommitment?.marketplaceId,
    rolloverCommitment?.collateralToken?.address,
    referralAddress,
    acceptCommitmentArgs,
    onSuccess,
    commitmentForwarderAddress,
    extensionContract,
    flashRolloverLoanAddress,
    collateralManagerAddress,
    error,
  ]);

  return useMemo(() => {
    return {
      walletBalance,
      transactions,
      rolloverLoanEstimation, // use this to display the amt the borrower will need to pay on frontend,
      borrowerAmount,
      /* repayLoanFull,
      futureAmountDueNum,
      futureAmountDueBN,
      totalOwedNum,
      nextDueDate,
      totalOwedBN,
      currentAmountDueBN,
      currentAmountDueNum*/
    };

    // below is the list of things that will cause a re-computation of transactions
  }, [walletBalance, transactions, rolloverLoanEstimation, borrowerAmount]);
};
export default useRolloverLoan;
