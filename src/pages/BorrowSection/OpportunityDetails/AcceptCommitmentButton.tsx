import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";

import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import TransactionButton, {
  TransactionStepConfig,
} from "../../../components/TransactionButton";
import { useGetUserTokenContext } from "../../../contexts/UserTokensContext";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { CommitmentType } from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
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
    (token) => token.address === collateralToken?.token?.address
  )?.balance;

  const hasInsufficientCollateral =
    +(collateralTokenBalance ?? 0) < (collateralToken?.value ?? 0);

  const isNotConnected = !address;

  const chainId = useChainId();

  // const signer: any = useSigner({
  //   chainId: chain?.id,
  // });
  // const provider = useProvider({
  //   chainId: chain?.id,
  // });

  const { isCommitmentFromLCFAlpha, lcfAlphaAddress } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);

  const commitmentForwarderAddress = commitment?.forwarderAddress;

  // const { isNativeToken } = useIsNativeToken(collateralToken?.token?.symbol);

  // const WMatic = contracts[SupportedContractsEnum.WMatic];
  // const WEth = contracts[SupportedContractsEnum.WETH];

  // const { wrappedTokenContractAddress, wrappedTokenContractABI } =
  //   useWrappedData();

  const hasApprovedForwarder = useReadContract<boolean>(
    SupportedContractsEnum.TellerV2,
    "hasApprovedMarketForwarder",
    [commitment?.marketplaceId, commitmentForwarderAddress, address],
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
    hasApprovedForwarder.isLoading ||
    !!collateralManagerAddress ||
    collateralAllowance.isLoading;

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
    steps.push(row2);
    if (isNotConnected) {
      row2.push({
        buttonLabel: <span>Please connect wallet to continue</span>,
        isStepDisabled: true,
      });
      return steps;
    }
    if (!hasApprovedForwarder.isLoading && !hasApprovedForwarder.data) {
      row2.push({
        buttonLabel: <span>Approve Teller</span>,
        loadingButtonLabel: <span>Approving Teller...</span>,
        contractName: SupportedContractsEnum.TellerV2,
        functionName: "approveMarketForwarder",
        args: [commitment.marketplaceId, commitmentForwarderAddress],
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

    const row3: TransactionStepConfig[] = [];
    steps.push(row3);

    const step3FunctionName = "acceptCommitment";

    const step3Args = [
      commitment.id,
      principalToken,
      collateralToken?.valueBI,
      0, // collateral token ID (only used for NFTs)
      // isNativeToken
      //   ? wrappedTokenContractAddress
      //   : collateralToken.token.address,
      commitment.collateralToken?.address,
      commitment.minAPY,
      commitment.maxDuration,
    ];

    if (!isLoadingTransactionInfo)
      row3.push({
        buttonLabel: <span>Deposit & Borrow</span>,
        loadingButtonLabel: <span>Executing Loan...</span>,
        contractName: isCommitmentFromLCFAlpha
          ? SupportedContractsEnum.LenderCommitmentForwarderAlpha
          : SupportedContractsEnum.LenderCommitmentForwarder,
        functionName: step3FunctionName,
        args: step3Args,
        onSuccess,
      });

    return steps;
  }, [
    commitment,
    isNotConnected,
    hasApprovedForwarder.isLoading,
    hasApprovedForwarder.data,
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
