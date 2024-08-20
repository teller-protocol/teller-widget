import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";

import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import TransactionButton, {
  TransactionStepConfig,
} from "../../../components/TransactionButton";
import { useGetUserTokenContext } from "../../../contexts/UserTokensContext";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { CommitmentType } from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { lrfAddressMap } from "../../../constants/lrfAddresses";
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
  collateralToken?: TokenInputType;

  onSuccess?: (bidId?: string, txHash?: string) => void;
}

export const AcceptCommitmentButton: React.FC<Props> = ({
  commitment,
  principalToken,
  collateralToken,
}) => {
  const { address } = useAccount();

  const { userTokens } = useGetUserTokenContext();
  const {
    setCurrentStep,
    setSuccessLoanHash,
    setSuccessfulLoanParams,
    setBidId,
  } = useGetBorrowSectionContext();
  const collateralTokenBalance = userTokens.find(
    (token) => token.address === collateralToken?.token?.address,
  )?.balance;

  const hasInsufficientCollateral =
    Number(collateralTokenBalance ?? 0) < Number(collateralToken?.value ?? 0);

  const isNotConnected = !address;

  const chainId = useChainId();
  const { referralFee, referralAddress } = useGetUserTokenContext();
  const lrfAddress = lrfAddressMap[chainId];

  const referralFeeAmount = (BigInt(referralFee) * principalToken)/BigInt(10000);

  // const signer: any = useSigner({
  //   chainId: chain?.id,
  // });
  // const provider = useProvider({
  //   chainId: chain?.id,
  // });

  const { isCommitmentFromLCFAlpha, lcfAlphaAddress } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);

  const commitmentForwarderAddress = commitment?.forwarderAddress;

  const lcfContractName = isCommitmentFromLCFAlpha
    ? SupportedContractsEnum.LenderCommitmentForwarderAlpha
    : SupportedContractsEnum.LenderCommitmentForwarderStaging;

  // const { isNativeToken } = useIsNativeToken(collateralToken?.token?.symbol);

  // const WMatic = contracts[SupportedContractsEnum.WMatic];
  // const WEth = contracts[SupportedContractsEnum.WETH];

  // const { wrappedTokenContractAddress, wrappedTokenContractABI } =
  //   useWrappedData();

  const acceptCommitmentArgs: any = useMemo(
    () => ({
      commitmentId: commitment?.id,
      smartCommitmentAddress: "0x0000000000000000000000000000000000000000",
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
      collateralToken?.valueBI,
    ],
  );

  const hasApprovedForwarder = useReadContract<boolean>(
    SupportedContractsEnum.TellerV2,
    "hasApprovedMarketForwarder",
    [commitment?.marketplaceId, commitmentForwarderAddress, address],
    !commitment?.marketplaceId,
  );

  const hasAddedExtension = useReadContract<boolean>(
    lcfContractName,
    "hasExtension",
    [address, lrfAddress],
    !commitment?.marketplaceId,
  );

  const { data: collateralManagerAddress } = useReadContract<string>(
    SupportedContractsEnum.TellerV2,
    "collateralManager",
    [],
  );

  const collateralAllowance = useReadContract<bigint>(
    collateralToken?.token?.address,
    "allowance",
    [address, collateralManagerAddress],
    false,
    ContractType.ERC20,
  );

  const isLoadingTransactionInfo =
    hasApprovedForwarder.isLoading || collateralAllowance.isLoading;

  const onSuccess = useCallback(
    (data: any, params: any) => {
      setCurrentStep(BorrowSectionSteps.SUCCESS);
      setSuccessLoanHash(data);
      setSuccessfulLoanParams(params);
    },
    [setCurrentStep, setSuccessLoanHash, setSuccessfulLoanParams],
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
        buttonLabel: "Enable Widget",
        loadingButtonLabel: "Enabling widget...",
        contractName: lcfContractName,
        functionName: "addExtension",
        args: [lrfAddress],
      });
    }

    // if (isNativeToken) {
    //   const wrappedTokenContract = new Contract(
    //     wrappedTokenContractAddress,
    //     wrappedTokenContractABI,
    //     provider
    //   );
    //   const tx = async () =>
    //     await wrappedTokenContract.connect(signer.data ?? "").deposit({
    //       value: BigNumber.from(collateralToken.valueBN),
    //     });

    //   row2.push({
    //     buttonLabel: <span>Wrap {collateralToken.token.symbol}</span>,
    //     tx: (collateralToken.value || 0) > 0 ? tx : undefined,
    //     loadingButtonLabel: `Wrapping ${collateralToken.token.symbol}...`,
    //     errorMessage: "",
    //   });
    // }

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

    const step3FunctionName = "acceptCommitmentWithReferral";

    const step3Args = [
      commitmentForwarderAddress,
      acceptCommitmentArgs,
      address, // recipient, this wallet address
      referralFeeAmount, // _reward
      referralAddress, // _rewardRecipient
    ];

    if (!isLoadingTransactionInfo)
      row4.push({
        buttonLabel: <span>Deposit & Borrow Referral</span>,
        loadingButtonLabel: <span>Executing Loan...</span>,
        contractName: SupportedContractsEnum.LoanReferralForwarder,
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
    principalToken,
    isLoadingTransactionInfo,
    isCommitmentFromLCFAlpha,
    onSuccess,
    commitmentForwarderAddress,
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
