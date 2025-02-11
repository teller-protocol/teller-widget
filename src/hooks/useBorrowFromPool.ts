import { useAccount, useToken } from "wagmi";

import { AddressStringType } from "../types/addressStringType";
import { ContractType, useReadContract } from "./useReadContract";
import { SupportedContractsEnum } from "./useReadContract";
import { TransactionStepConfig } from "../components/TransactionButton/TransactionButton";
import { useContracts } from "./useContracts";

export const useBorrowFromPool = ({
  commitmentPoolAddress,
  principalAmount,
  collateralAmount,
  collateralTokenAddress,
  loanDuration,
  marketId,
  skip = false,
  onSuccess,
}: {
  commitmentPoolAddress: string;
  principalAmount: string;
  collateralAmount: string;
  collateralTokenAddress: string;
  loanDuration?: string;
  marketId?: string;
  skip?: boolean;
  onSuccess?: (receipt: any, params: any) => void;
}) => {
  const transactions: TransactionStepConfig[] = [];
  const { address } = useAccount();

  const contracts = useContracts();

  const SMART_COMMITMENT_FORWARDER_POLYGON_ADDRESS =
    contracts[SupportedContractsEnum.SmartCommitmentForwarder].address;

  const { data: hasApprovedForwarder } = useReadContract<boolean>(
    SupportedContractsEnum.TellerV2,
    "hasApprovedMarketForwarder",
    [marketId, SMART_COMMITMENT_FORWARDER_POLYGON_ADDRESS, address],
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
    ContractType.LenderGroups
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

  if (!hasApprovedForwarder) {
    transactions.push({
      contractName: SupportedContractsEnum.TellerV2,
      functionName: "approveMarketForwarder",
      args: [marketId, SMART_COMMITMENT_FORWARDER_POLYGON_ADDRESS],
      buttonLabel: `Approve Teller`,
      loadingButtonLabel: `Approving teller...`,
    });
  }

  transactions.push({
    contractName: SupportedContractsEnum.SmartCommitmentForwarder,
    functionName: "acceptSmartCommitmentWithRecipient",
    args: [
      commitmentPoolAddress,
      BigInt(principalAmount),
      BigInt(collateralAmount),
      BigInt(0),
      collateralTokenAddress,
      address,
      minInterestRate,
      loanDuration,
    ],
    buttonLabel: `Deposit & Borrow`,
    loadingButtonLabel: `Borrowing...`,
    onSuccess: (receipt, params) => {
      onSuccess?.(receipt, params);
    },
  });

  return transactions;
};
