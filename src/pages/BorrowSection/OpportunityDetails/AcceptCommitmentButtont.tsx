import { useAccount, useChainId } from "wagmi";
import { useContracts } from "../../../hooks/useContracts";
import { useGetMaxPrincipalPerCollateralFromLCFAlpha } from "../../../hooks/useGetMaxPrincipalPerCollateralFromLCFAlpha";
import { CommitmentType } from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "../../../hooks/useReadContract";
import TransactionButton, {
  TransactionStepConfig,
} from "../../../components/TransactionButton";
import { useMemo } from "react";
import Button from "../../../components/Button";

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

  onSuccess,
}) => {
  const { address } = useAccount();

  const contracts = useContracts();

  const chainId = useChainId();

  // const signer: any = useSigner({
  //   chainId: chain?.id,
  // });
  // const provider = useProvider({
  //   chainId: chain?.id,
  // });

  const { isCommitmentFromLCFAlpha, lcfAlphaAddress } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);

  const commitmentForwarderAddress =
    contracts?.[
      lcfAlphaAddress
        ? SupportedContractsEnum.LenderCommitmentForwarderAlpha
        : SupportedContractsEnum.LenderCommitmentForwarder
    ]?.address;

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
    collateralManagerAddress?.isLoading ||
    collateralAllowance.isLoading;

  console.log(
    "TCL ~ file: AcceptCommitmentButtont.tsx:84 ~ isLoadingTransactionInfo:",
    isLoadingTransactionInfo
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

    if (collateralAllowance.data < collateralToken?.valueBI) {
      row2.push({
        buttonLabel: <span>Approve {collateralToken.token.symbol}</span>,
        loadingButtonLabel: (
          <span>
            Approving {collateralToken.value} {collateralToken.token.symbol}...
          </span>
        ),
        contractName: collateralToken.token.address,
        functionName: "approve",
        args: [
          collateralManagerAddress,
          BigInt(collateralToken?.valueBI) * BigInt(10),
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
      collateralToken.valueBI,
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
        enabled: true,
      });

    return steps;
  }, [
    commitment,
    hasApprovedForwarder.isLoading,
    hasApprovedForwarder.data,
    collateralAllowance.data,
    collateralToken,
    principalToken,
    isLoadingTransactionInfo,
    isCommitmentFromLCFAlpha,
    commitmentForwarderAddress,
    collateralManagerAddress,
  ]);

  return <TransactionButton transactions={steps} />;
};
