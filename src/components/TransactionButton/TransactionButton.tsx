import cx from "classnames";
import { Fragment, ReactNode, useCallback, useMemo, useState } from "react";
import { useWriteContract } from "../../hooks/useWriteContract";
import { TransactionReceipt } from "viem";
import Button from "../Button";
import { ContractType } from "../../hooks/useReadContract";

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
  onSuccess?: (receipt: TransactionReceipt) => void;
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
};
const TransactionButton = ({
  transactions,
  autoStep = true,
  onSuccess,
  isButtonDisabled = false,
  buttonDisabledMessage,
  isLoading,
}: TransactionButtonProps) => {
  const [currentStepID, _setCurrentStepID] = useState(0);

  const setCurrentStepID = useCallback<typeof _setCurrentStepID>(
    (id) => {
      if (autoStep) _setCurrentStepID(id);
    },
    [autoStep]
  );
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

  const onSuccessTransaction = useCallback(
    (receipt: TransactionReceipt) => {
      setCurrentStepID((currentStepID: number) => {
        return currentStepID + 1;
      });
      // setReceipt(receipt);
      // currentStep?.onSuccess?.(receipt);
      // onSuccess?.();
    },
    [setCurrentStepID]
  );

  const {
    data,
    error,
    isConfirmed,
    isError,
    isPending,
    isSimulationLoading,
    successData,
    writeContract,
    simulatedData,
  } = useWriteContract({
    contractName: currentStep?.contractName,
    functionName: currentStep?.functionName,
    args: currentStep?.args,
    contractType: currentStep?.contractType,
  });

  if (isError) {
    console.error("Error writing contract", error);
  }

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  const [customTxLoading, setCustomTxLoading] = useState(false);
  const [customTxError, setCustomTxError] = useState(false);

  // const isDisabled =
  //   isButtonDisabled ||
  //   currentStep?.isStepDisabled ||
  //   (!ModalBody &&
  //     (!!transactionLoading ||
  //       (!writeTransaction && !currentStep?.tx) ||
  //       !!currentStep?.errorMessage)) ||
  //   !!customTxLoading;

  const renderButton = useCallback(
    (step: TransactionStepConfig, stepId: number) =>
      currentStepID <= stepId && (
        <>
          <Button
            key={stepId}
            onClick={async () => {
              isLastStep && step.onClick?.();
              if (step.tx) {
                try {
                  setCustomTxLoading(true);
                  const tx = await step.tx();
                  const receipt = await tx?.wait();
                  onSuccessTransaction(receipt);
                  setCustomTxLoading(false);
                } catch (e) {
                  console.error("Error sending custom tx", e);
                  setCustomTxLoading(false);
                  setCustomTxError(true);
                }
              }
              if (writeContract && simulatedData?.request)
                writeContract(simulatedData?.request, {
                  onSuccess: onSuccessTransaction,
                });
            }}
            disabled={stepId !== currentStepID}
          >
            {(isPending || customTxLoading) &&
            step.buttonLabel === currentStep?.buttonLabel
              ? step.loadingButtonLabel
              : step?.buttonLabel}
          </Button>
        </>
      ),
    [
      currentStep?.buttonLabel,
      currentStepID,
      customTxLoading,
      isLastStep,
      isPending,
      onSuccessTransaction,
      simulatedData?.request,
      writeContract,
    ]
  );

  return (
    <div
      className={cx(
        "transaction-button",
        (isSimulationLoading || isLoading) && "loading"
      )}
    >
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

      {((isButtonDisabled && buttonDisabledMessage) ||
        (currentStep?.isStepDisabled && currentStep?.disabledMessage)) && (
        <div className="italic text-center text-red text-tellerLight-secondary">
          {buttonDisabledMessage ?? currentStep?.disabledMessage}
        </div>
      )}
    </div>
  );
};

export default TransactionButton;
