import { useMemo } from "react";
import { useAccount, useToken } from "wagmi";

import { TransactionStepConfig } from "../components/TransactionButton/TransactionButton";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import { AddressStringType } from "../types/addressStringType";

import { useContracts } from "./useContracts";
import {
  ContractType,
  useReadContract,
  SupportedContractsEnum,
} from "./useReadContract";

export const useBorrowFromPool = ({
  commitmentPoolAddress,
  principalAmount,
  collateralAmount,
  collateralTokenAddress,
  isV2,
  loanDuration,
  marketId,
  skip = false,
  onSuccess,
}: {
  commitmentPoolAddress: string;
  principalAmount: string;
  collateralAmount: string;
  collateralTokenAddress: string;
  isV2: boolean;
  loanDuration?: string;
  marketId?: string;
  skip?: boolean;
  onSuccess?: (receipt: any, params: any) => void;
}) => {
  const transactions: TransactionStepConfig[] = [];
  const { address } = useAccount();

  const { referralFee, referralAddress } = useGetGlobalPropsContext();
  const referralFeeAmount =
    (BigInt(referralFee ?? 0) * BigInt(principalAmount ?? 0)) / BigInt(10000);

  const contracts = useContracts();

  const SMART_COMMITMENT_FORWARDER_ADDRESS =
    contracts[SupportedContractsEnum.SmartCommitmentForwarder].address;
  const LOAN_REFERRAL_ADDRESS =
    contracts[SupportedContractsEnum.LoanReferralForwarder].address;

  const { data: hasApprovedForwarder } = useReadContract<boolean>(
    SupportedContractsEnum.TellerV2,
    "hasApprovedMarketForwarder",
    [marketId, SMART_COMMITMENT_FORWARDER_ADDRESS, address],
    !marketId || skip
  );

  const hasAddedExtension = useReadContract<boolean>(
    SupportedContractsEnum.SmartCommitmentForwarder,
    "hasExtension",
    [address, LOAN_REFERRAL_ADDRESS],
    !marketId || skip
  );

  const collateralTokenData = useToken({
    address: collateralTokenAddress as AddressStringType,
  });

  const { data: minInterestRate } = useReadContract(
    commitmentPoolAddress as AddressStringType,
    "getMinInterestRate",
    [principalAmount],
    false || skip,
    isV2 ? ContractType.LenderGroupsV2 : ContractType.LenderGroups
  );

  const { data: collateralManagerAddress } = useReadContract<string>(
    SupportedContractsEnum.TellerV2,
    "collateralManager",
    []
  );

  const collateralAllowance = useReadContract<bigint>(
    collateralTokenAddress as AddressStringType,
    "allowance",
    [address, collateralManagerAddress],
    !collateralTokenAddress || skip,
    ContractType.ERC20
  );

  if (skip) return transactions;

  if (!address) {
    transactions.push({
      buttonLabel: "Please connect wallet to continue",
      isStepDisabled: true,
    });
    return transactions;
  }

  if (BigInt(collateralAllowance?.data ?? 0) < BigInt(collateralAmount)) {
    transactions.push({
      contractName: collateralTokenAddress as AddressStringType,
      functionName: "approve",
      args: [collateralManagerAddress, BigInt(collateralAmount) * 10n],
      buttonLabel: `Approve ${collateralTokenData?.data?.symbol}`,
      loadingButtonLabel: `Approving ${collateralTokenData?.data?.symbol}...`,
      contractType: ContractType.ERC20,
    });
  }

  const acceptCommitmentArgs: any = useMemo(
    () => ({
      commitmentId: 0,
      smartCommitmentAddress: commitmentPoolAddress,
      principalAmount: BigInt(principalAmount),
      collateralAmount: BigInt(collateralAmount),
      collateralTokenId: 0,
      collateralTokenAddress: collateralTokenAddress,
      interestRate: minInterestRate,
      loanDuration: loanDuration,
      merkleProof: [],
    }),
    [
      commitmentPoolAddress,
      principalAmount,
      collateralAmount,
      collateralTokenAddress,
      minInterestRate,
      loanDuration,
    ]
  );

  if (!hasApprovedForwarder) {
    transactions.push({
      contractName: SupportedContractsEnum.TellerV2,
      functionName: "approveMarketForwarder",
      args: [marketId, SMART_COMMITMENT_FORWARDER_ADDRESS],
      buttonLabel: `Approve Teller`,
      loadingButtonLabel: `Approving teller...`,
    });
  }

  if (!hasAddedExtension.isLoading && !hasAddedExtension.data) {
    transactions.push({
      buttonLabel: "Enable Borrowing",
      loadingButtonLabel: "Enabling borrowing...",
      contractName: SupportedContractsEnum.SmartCommitmentForwarder,
      functionName: "addExtension",
      args: [LOAN_REFERRAL_ADDRESS],
    });
  }

  transactions.push({
    contractName: SupportedContractsEnum.LoanReferralForwarder,
    functionName: "acceptCommitmentWithReferral",
    args: [
      SMART_COMMITMENT_FORWARDER_ADDRESS,
      acceptCommitmentArgs,
      address,
      referralFeeAmount,
      referralAddress,
    ],
    buttonLabel: `Deposit & Borrow`,
    loadingButtonLabel: `Borrowing...`,
    onSuccess: (receipt, params) => {
      onSuccess?.(receipt, params);
    },
  });

  return transactions;
};
