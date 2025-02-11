import { Fragment, ReactNode, useCallback, useMemo, useState } from "react";
import { waitForTransactionReceipt } from "wagmi/actions";
import { ContractType } from "../../hooks/useReadContract";
import { useWriteContract } from "../../hooks/useWriteContract";
import Button from "../Button";

import { config } from "../../helpers/createWagmiConfig";

import Loader from "../Loader";
import "./transactionButton.scss";

export type TransactionStepConfig = {
  contractName?: string;
  buttonLabel?: ReactNode;
  loadingButtonLabel?: ReactNode;
  functionName?: string;
  args?: any[];
  enabled?: boolean;
  errorMessage?: string;
  // tooltip?: string;
  tx?: any;
  onClick?: () => void;
  onSuccess?: (data: any, params: any) => void;
  onError?: (error: Error) => void;
  isLastStep?: boolean;
  isStepDisabled?: boolean;
  disabledMessage?: string;
  contractType?: ContractType;
};
export type TransactionButtonProps = {
  transactions: TransactionStepConfig[] | TransactionStepConfig[][];
  onSuccess?: () => void;
  autoStep?: boolean;
  hideCtaOnSuccess?: boolean;
  isButtonDisabled?: boolean;
  buttonDisabledMessage?: string;
  isLoading?: boolean;
  onTransactionConfirmed?: (data: any) => void;
};
const TransactionButton = ({
  transactions,
  autoStep = true,
  onSuccess,
  isButtonDisabled = false,
  buttonDisabledMessage,
  isLoading,
}: TransactionButtonProps) => {
  const [currentStepID, setCurrentStepID] = useState(0);

  const [isConfirming, setIsConfirming] = useState(false);

  const steps = useMemo(() => transactions.flat(), [transactions]);

  const isLastStep = useMemo(
    () => currentStepID >= steps.length - 1,
    [currentStepID, steps.length]
  );
  const currentStep = useMemo(() => {
    const step = steps[currentStepID];
    if (step)
      return Object.assign(
        {
          enabled: true,
        },
        step
      );
  }, [currentStepID, steps]);

  const isDisabled =
    isButtonDisabled ||
    currentStep?.isStepDisabled ||
    !!currentStep?.errorMessage;
  // || !!customTxLoading;

  const {
    data,
    error,
    isConfirmed,
    isPending,
    isSimulationLoading,
    successData,
    writeContract,
    simulatedData,
    simulatedError,
    writeError,
  } = useWriteContract({
    contractName: currentStep?.contractName,
    functionName: currentStep?.functionName,
    args: currentStep?.args,
    contractType: currentStep?.contractType,
    skip: isDisabled,
  });

  const onSuccessTransaction = useCallback(
    async (data: any, params: any) => {
      setIsConfirming(true);
      await waitForTransactionReceipt(config, {
        hash: data,
        confirmations: 1,
      })
        .then((res: any) => {
          setCurrentStepID((currentStepID: number) => {
            return currentStepID + 1;
          });
          currentStep?.onSuccess?.(data, params);
          onSuccess?.();
        })
        .catch((e) => {
          console.error("Error waiting for transaction receipt", e);
        })
        .finally(() => setIsConfirming(false));
    },
    [currentStep, onSuccess, setCurrentStepID]
  );

  if (simulatedError || writeError) {
    console.error("Error writing contract", error);
  }

  const [customTxLoading, setCustomTxLoading] = useState(false);
  const [customTxError, setCustomTxError] = useState(false);

  const renderButton = useCallback(
    (step: TransactionStepConfig, stepId: number) =>
      currentStepID <= stepId && (
        <>
          <Button
            key={stepId}
            onClick={() => {
              isLastStep && step.onClick?.();
              // if (step.tx) {
              //   try {
              //     setCustomTxLoading(true);
              //     const tx = await step.tx();
              //     const receipt = await tx?.wait();
              //     onSuccessTransaction(receipt);
              //     setCustomTxLoading(false);
              //   } catch (e) {
              //     console.error("Error sending custom tx", e);
              //     setCustomTxLoading(false);
              //     setCustomTxError(true);
              //   }
              // }
              if (writeContract && simulatedData?.request)
                writeContract(simulatedData?.request, {
                  onSuccess: (data: any, params: any) =>
                    void (async () => onSuccessTransaction(data, params))(),
                });
            }}
            disabled={
              isDisabled ||
              stepId !== currentStepID ||
              isSimulationLoading ||
              isLoading ||
              isButtonDisabled ||
              isPending ||
              currentStep?.isStepDisabled ||
              !!currentStep?.errorMessage ||
              isConfirming ||
              !!simulatedError
            }
          >
            {(isPending || customTxLoading || isConfirming) &&
            step.buttonLabel === currentStep?.buttonLabel
              ? step.loadingButtonLabel
              : step?.buttonLabel}
          </Button>
        </>
      ),
    [
      currentStep?.buttonLabel,
      currentStep?.errorMessage,
      currentStep?.isStepDisabled,
      currentStepID,
      customTxLoading,
      isButtonDisabled,
      isConfirming,
      isDisabled,
      simulatedError,
      isLastStep,
      isLoading,
      isPending,
      isSimulationLoading,
      onSuccessTransaction,
      simulatedData?.request,
      writeContract,
    ]
  );

  return (
    <div className="transaction-button">
      <>
        {isSimulationLoading || isLoading ? (
          <Loader isSkeleton height={40} />
        ) : (
          <>
            {
              [...transactions]
                .filter((tx) => (Array.isArray(tx) ? tx.length > 0 : tx))
                .reduce<{
                  count: number;
                  rows: Array<ReactNode>;
                }>(
                  (acc1, step, i) => ({
                    count: acc1.count + (Array.isArray(step) ? step.length : 1),
                    rows: acc1.rows.concat([
                      <Fragment key={i}>
                        <div className="transaction-button-row">
                          {(Array.isArray(step) ? step : [step]).reduce<
                            Array<ReactNode>
                          >(
                            (acc2, s, j) =>
                              acc2.concat(renderButton(s, acc1.count + j)),
                            []
                          )}
                        </div>
                      </Fragment>,
                    ]),
                  }),
                  { count: 0, rows: [] }
                ).rows
            }
          </>
        )}
      </>

      {((isButtonDisabled && buttonDisabledMessage) ||
        currentStep?.errorMessage) && (
        <div className="disabled-text-message section-title">
          {buttonDisabledMessage ?? currentStep?.errorMessage}
        </div>
      )}
    </div>
  );
};

export default TransactionButton;
