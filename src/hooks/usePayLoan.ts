import { useCallback, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { numberWithCommasAndDecimals } from "../helpers/numberUtils";
import { Loan } from "./queries/useGetActiveLoansForUser";
import { useContracts } from "./useContracts";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "./useReadContract";

export const usePayLoan = (
  loan: Loan,
  amount: bigint,
  onSuccessTx?: (data: any) => void
) => {
  {
    const { address: walletConnectedAddress } = useAccount();

    const contracts = useContracts();

    const tellerV2Contract = contracts?.[SupportedContractsEnum.TellerV2];
    const tellerV2ContractAddress = tellerV2Contract?.address;

    const tokenContractName = loan.lendingToken.address;

    const { data: tellerV2Allowance, error: allowanceError } = useReadContract(
      tokenContractName,
      "allowance",
      [walletConnectedAddress, tellerV2ContractAddress],
      false,
      ContractType.ERC20
    );
    const [cachedNow] = useState(+(Date.now() / 1000).toFixed());
    const future1Hour = useMemo(
      () => (3600 + cachedNow).toFixed(),
      [cachedNow]
    );

    const { data: nextDueDateData = loan.nextDueDate }: any = useReadContract(
      SupportedContractsEnum.TellerV2,
      `calculateNextDueDate(uint256)`,
      [loan.bidId],
      false
    );
    const nextDueDate =
      nextDueDateData < cachedNow ? cachedNow : nextDueDateData;

    const {
      data: currentDueData,
      error: currentDueDataError,
      isFetched: currentDueDataIsFetched,
    }: any = useReadContract(
      SupportedContractsEnum.TellerV2,
      `calculateAmountDue`,
      [loan.bidId, future1Hour]
    );

    const currentAmountDueBI = currentDueDataIsFetched
      ? BigInt(currentDueData.interest) + BigInt(currentDueData.principal)
      : BigInt(0);

    const currentAmountDueNum = formatUnits(
      currentAmountDueBI,
      loan.lendingToken.decimals
    );

    const {
      data: futureDueData,
      error: futureDueDataError,
      isFetched: futureDueDataIsFetched,
    }: any = useReadContract(
      SupportedContractsEnum.TellerV2,
      `calculateAmountDue`,
      [loan.bidId, nextDueDate]
    );
    const futureAmountDueBI = futureDueDataIsFetched
      ? BigInt(futureDueData.interest) + BigInt(futureDueData.principal)
      : BigInt(0);

    const futureAmountDueNum = formatUnits(
      futureAmountDueBI,
      loan.lendingToken.decimals
    );

    const {
      data: totalOwedData,
      error: totalOwedDataError,
      isFetched: totalOwedDataIsFetched,
    }: any = useReadContract(
      SupportedContractsEnum.TellerV2,
      `calculateAmountOwed`,
      [loan.bidId, loan.nextDueDate],
      !loan.nextDueDate
    );

    const totalOwedBI = totalOwedDataIsFetched
      ? BigInt(totalOwedData.interest) + BigInt(totalOwedData.principal)
      : BigInt(0);

    const totalOwedNum = formatUnits(totalOwedBI, loan.lendingToken.decimals);

    const walletBalance = useReadContract(
      loan.lendingTokenAddress,
      "balanceOf",
      [walletConnectedAddress],
      false,
      ContractType.ERC20
    );
    const formattedWalletBalance = numberWithCommasAndDecimals(
      formatUnits(BigInt(walletBalance.data ?? 0), loan.lendingToken.decimals)
    );

    const amountBI = amount;

    const amountNum = formatUnits(amountBI, loan.lendingToken.decimals);

    const repayLoanFull = useMemo(() => {
      return amountBI && amountBI >= (totalOwedBI * BigInt(100)) / BigInt(98);
    }, [amountBI, totalOwedBI]);

    const repayLoanMinimum = useMemo(() => {
      return (
        amountBI && amountBI <= (currentAmountDueBI / BigInt(100)) * BigInt(101)
      );
    }, [amountBI, currentAmountDueBI]);

    const onSuccess = useCallback(
      (data: any) => {
        onSuccessTx?.(data);
      },
      [onSuccessTx]
    );

    const transactions = useMemo(() => {
      let id = 0;
      const steps: any[] = [];
      if (!amountNum || !amountBI)
        return [
          {
            buttonLabel: "Pay",
            isStepDisabled: true,
          },
        ];

      let errorMessage =
        amountBI > BigInt(walletBalance?.data) ? "Insufficient funds." : "";

      if (currentAmountDueBI > amountBI) {
        errorMessage = `Please select amount bigger than ${currentAmountDueNum}`;
      }

      if (amountBI > BigInt(tellerV2Allowance)) {
        steps.push({
          contractName: loan?.lendingTokenAddress,
          args: [tellerV2ContractAddress, amountBI * BigInt(10)],
          functionName: "approve",
          buttonLabel: `Approve ${loan.lendingToken.symbol}`,
          loadingButtonLabel: `Approving ${loan.lendingToken.symbol}...`,
          errorMessage,
          tooltip: `Permission is required for Teller to pay loan`,
          id,
          contractType: ContractType.ERC20,
        });
        id++;
      }
      if (repayLoanFull) {
        steps.push({
          contractName: SupportedContractsEnum.TellerV2,
          functionName: "repayLoanFull",
          args: [loan.bidId],
          buttonLabel: `Repay loan`,
          loadingButtonLabel: "Paying...",
          errorMessage,
          id,
          onSuccess,
        });
        id++;
      } else if (repayLoanMinimum) {
        steps.push({
          contractName: SupportedContractsEnum.TellerV2,
          functionName: "repayLoanMinimum",
          args: [loan.bidId],
          buttonLabel: `Pay`,
          loadingButtonLabel: "Paying...",
          errorMessage,
          onSuccess,
          id,
        });
        id++;
      } else {
        steps.push({
          contractName: SupportedContractsEnum.TellerV2,
          functionName: "repayLoan",
          args: [loan.bidId, amountBI],
          buttonLabel: `Pay ${amountNum} ${loan.lendingToken.symbol}`,
          loadingButtonLabel: "Paying...",
          errorMessage,
          id,
          onSuccess,
        });
        id++;
      }
      return steps;
    }, [
      amountNum,
      amountBI,
      walletBalance?.data,
      currentAmountDueBI,
      tellerV2Allowance,
      repayLoanFull,
      repayLoanMinimum,
      currentAmountDueNum,
      loan?.lendingTokenAddress,
      loan.lendingToken.symbol,
      loan.bidId,
      tellerV2ContractAddress,
      onSuccess,
    ]);

    return useMemo(() => {
      return {
        formattedWalletBalance,
        transactions,
        totalOwedNum,
        currentAmountDueBI,
        currentAmountDueNum,
      };
    }, [
      formattedWalletBalance,
      transactions,
      totalOwedNum,
      currentAmountDueBI,
      currentAmountDueNum,
    ]);
  }
};
