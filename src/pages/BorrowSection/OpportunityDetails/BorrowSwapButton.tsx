import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";

import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import TransactionButton, {
  TransactionStepConfig,
} from "../../../components/TransactionButton";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { CommitmentType } from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { borrowSwapAddressMap } from "../../../constants/borrowSwapAddresses";
import { useContracts } from "../../../hooks/useContracts";
import { useGetMaxPrincipalPerCollateralFromLCFAlpha } from "../../../hooks/useGetMaxPrincipalPerCollateralFromLCFAlpha";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "../../../hooks/useReadContract";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";

interface Props {
  commitment?: CommitmentType;
  principalToken?: bigint;
  principalTokenAddress?: AddressStringType;
  collateralToken?: TokenInputType;
  borrowSwapPaths?: [];
  borrowQuoteExactInput?: bigint;

  onSuccess?: (bidId?: string, txHash?: string) => void;
}

export const BorrowSwapButton: React.FC<Props> = ({
  commitment,
  principalToken,
  principalTokenAddress,
  collateralToken,
  borrowSwapPaths,
  borrowQuoteExactInput,
}) => {
  const { address } = useAccount();

  const { userTokens } = useGetGlobalPropsContext();
  const {
    setCurrentStep,
    setSuccessLoanHash,
    setSuccessfulLoanParams,
    setBidId,
  } = useGetBorrowSectionContext();
  const collateralTokenBalance = userTokens.find(
    (token) => token.address === collateralToken?.token?.address
  )?.balance;

  const hasInsufficientCollateral =
    Number(collateralTokenBalance ?? 0) < Number(collateralToken?.value ?? 0);

  const isNotConnected = !address;

  const chainId = useChainId();
  const { referralFee, referralAddress } = useGetGlobalPropsContext();
  const borrowSwapAddress = borrowSwapAddressMap[chainId];

  const referralFeeAmount =
    (BigInt(referralFee ?? 0) * BigInt(principalToken ?? 0)) / BigInt(10000);

  const { isCommitmentFromLCFAlpha, lcfAlphaAddress } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);

  const commitmentForwarderAddress = commitment?.forwarderAddress;

  const lcfContractName = commitment?.isLenderGroup
    ? SupportedContractsEnum.SmartCommitmentForwarder
    : SupportedContractsEnum.LenderCommitmentForwarderAlpha;

  console.log("commitment", commitment)

  const acceptCommitmentArgs: any = useMemo(
    () => ({
      commitmentId: commitment?.id,
      smartCommitmentAddress: commitment?.isLenderGroup
        ? commitment?.lenderAddress
        : "0x0000000000000000000000000000000000000000",
      principalAmount: principalToken,
      collateralAmount: collateralToken?.valueBI,
      collateralTokenId: 0,
      collateralTokenAddress: commitment?.collateralToken?.address,
      interestRate: commitment?.minAPY,
      loanDuration: commitment?.maxDuration,
      merkleProof: [],
    }),
    [
      commitment?.id,
      commitment?.collateralToken?.address,
      commitment?.minAPY,
      commitment?.maxDuration,
      principalToken,
      collateralToken?.valueBI,
    ]
  );

  const swapArgs = useMemo(() => {
    if (!borrowSwapPaths || !borrowQuoteExactInput) return undefined;

    return {
      swapPaths: borrowSwapPaths,
      amountOutMinimum: borrowQuoteExactInput * 95n / 100n,
    };
  }, [borrowSwapPaths, borrowQuoteExactInput]);

  const hasApprovedForwarder = useReadContract<boolean>(
    SupportedContractsEnum.TellerV2,
    "hasApprovedMarketForwarder",
    [commitment?.marketplaceId, commitmentForwarderAddress, address],
    !commitment?.marketplaceId
  );
  
  const hasAddedExtension = useReadContract<boolean>(
    lcfContractName,
    "hasExtension",
    [address, borrowSwapAddress],
    !commitment?.marketplaceId
  );

  const { data: collateralManagerAddress } = useReadContract<string>(
    SupportedContractsEnum.TellerV2,
    "collateralManager",
    []
  );

  const collateralAllowance = useReadContract<bigint>(
    collateralToken?.token?.address,
    "allowance",
    [address, collateralManagerAddress],
    false,
    ContractType.ERC20
  );

  const isLoadingTransactionInfo =
    hasApprovedForwarder.isLoading || collateralAllowance.isLoading;

  const onSuccess = useCallback(
    (data: any, params: any) => {
      setCurrentStep(BorrowSectionSteps.SUCCESS);
      setSuccessLoanHash(data);
      setSuccessfulLoanParams(params);
    },
    [setCurrentStep, setSuccessLoanHash, setSuccessfulLoanParams]
  );

  const steps = useMemo<TransactionStepConfig[][]>(() => {
    const steps: TransactionStepConfig[][] = [];
    if (!commitment) {
      console.error("AcceptCommitmentButton: Could not generate steps. ", {
        commitment,
        principalToken,
        collateralToken,
      });
      return steps;
    }

    const row2: TransactionStepConfig[] = [];
    const row3: TransactionStepConfig[] = [];
    const row301: TransactionStepConfig[] = [];
    steps.push(row2);
    if (isNotConnected) {
      row2.push({
        buttonLabel: <span>Please connect wallet to continue</span>,
        isStepDisabled: true,
      });
      return steps;
    }
    steps.push(row3);
    if (!hasApprovedForwarder.isLoading && !hasApprovedForwarder.data) {
      row3.push({
        buttonLabel: <span>Approve Teller</span>,
        loadingButtonLabel: <span>Approving Teller...</span>,
        contractName: SupportedContractsEnum.TellerV2,
        functionName: "approveMarketForwarder",
        args: [commitment.marketplaceId, commitmentForwarderAddress],
      });
    }

    steps.push(row301);
    if (!hasAddedExtension.isLoading && !hasAddedExtension.data) {
      row301.push({
        buttonLabel: "Enable Borrowing",
        loadingButtonLabel: "Enabling borrowing...",
        contractName: lcfContractName,
        functionName: "addExtension",
        args: [borrowSwapAddress],
      });
    }

    if ((collateralAllowance.data ?? 0) < (collateralToken?.valueBI ?? 0)) {
      row2.push({
        buttonLabel: <span>Approve {collateralToken?.token?.symbol}</span>,
        loadingButtonLabel: (
          <span>
            Approving{" "}
            {numberWithCommasAndDecimals((collateralToken?.value ?? 0) * 10)}{" "}
            {collateralToken?.token?.symbol}...
          </span>
        ),
        contractName: collateralToken?.token?.address,
        functionName: "approve",
        args: [
          collateralManagerAddress,
          BigInt(collateralToken?.valueBI ?? 0) * BigInt(10),
        ],
        contractType: ContractType.ERC20,
      });
    }

    const row4: TransactionStepConfig[] = [];
    steps.push(row4);

    // update below to borrowswap

    const step3FunctionName = "borrowSwap";

    // get swap args from below
    // get swap paths from generateSwapPath
    // get amountOutMinimum from quoteExactInput

    const step3Args = [
      commitmentForwarderAddress,
      principalTokenAddress,
      0,
      swapArgs,
      acceptCommitmentArgs,
    ];

    console.log("step3Args", step3Args)
    console.log("step3FunctionName", step3FunctionName)

    if (!isLoadingTransactionInfo)
      row4.push({
        buttonLabel: <span>Deposit & Borrow</span>,
        loadingButtonLabel: <span>Executing Loan...</span>,
        contractName: SupportedContractsEnum.BorrowSwap,
        functionName: step3FunctionName,
        args: step3Args,
        contractType: ContractType.External,
        onSuccess,
      });

    return steps;
  }, [
    commitment,
    isNotConnected,
    hasApprovedForwarder.isLoading,
    hasApprovedForwarder.data,
    hasAddedExtension.isLoading,
    hasAddedExtension.data,
    collateralAllowance.data,
    collateralToken,
    commitmentForwarderAddress,
    acceptCommitmentArgs,
    address,
    referralFeeAmount,
    referralAddress,
    isLoadingTransactionInfo,
    onSuccess,
    principalToken,
    lcfContractName,
    borrowSwapAddress,
    collateralManagerAddress,
  ]);

  return (
    <TransactionButton
      transactions={steps}
      isButtonDisabled={hasInsufficientCollateral}
      buttonDisabledMessage={isNotConnected ? "" : "Insufficient collateral"}
    />
  );
};
