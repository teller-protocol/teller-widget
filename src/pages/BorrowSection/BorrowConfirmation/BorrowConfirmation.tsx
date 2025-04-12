import { useChainId, useChains, useWaitForTransactionReceipt } from "wagmi";
import confirmationAsset from "../../../assets/confirmation.svg";
import confirmationBackground from "../../../assets/confirmation_background.png";
import externalLink from "../../../assets/external_link.svg";
import Button from "../../../components/Button";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import {
  useGetGlobalPropsContext,
  STRATEGY_ACTION_ENUM,
} from "../../../contexts/GlobalPropsContext";

import { Address, decodeEventLog, formatUnits } from "viem";
import Loader from "../../../components/Loader";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useContracts } from "../../../hooks/useContracts";
import { SupportedContractsEnum } from "../../../hooks/useReadContract";
import "./borrowConfirmation.scss";
import { useChainData } from "../../../hooks/useChainData";
import { normalizeChainName } from "../../../constants/chains";

const LabelWithIcon = ({ label }: { label: string }) => (
  <div className="label-with-icon">
    {label} <img src={externalLink} />
  </div>
);

const BorrowConfirmation = () => {
  const {
    successLoanHash,
    selectedOpportunity,
    setBidId,
    bidId,
    setCurrentStep,
    successfulLoanParams,
    selectedSwapToken,
    borrowSwapTokenInput,
  } = useGetBorrowSectionContext();
  const { isStrategiesSection, strategyAction } = useGetGlobalPropsContext();
  const contracts = useContracts();

  const { chainExplorerURL, chainName } = useChainData();

  const principalToken = selectedOpportunity?.principalToken;
  const collateralToken = selectedOpportunity?.collateralToken;

  const isLong = isStrategiesSection && strategyAction === STRATEGY_ACTION_ENUM.LONG;
  const isShort = isStrategiesSection && strategyAction === STRATEGY_ACTION_ENUM.SHORT;

  const formattedPrincipalAmount = numberWithCommasAndDecimals(
    formatUnits(
      isShort
        ? successfulLoanParams.args?.[4]["principalAmount"]
        : successfulLoanParams.args?.[1]["principalAmount"] ?? 0n,
      principalToken?.decimals ?? 0
    )
  );

  const formattedLongTokenAmount = numberWithCommasAndDecimals(
    formatUnits(
      borrowSwapTokenInput?.valueBI ?? 0n,
      selectedSwapToken?.decimals ?? 0
    )
  );

  const formattedCollateralAmount = numberWithCommasAndDecimals(
    formatUnits(
      isLong || isShort
        ? successfulLoanParams.args?.[4]["collateralAmount"]
        : successfulLoanParams.args?.[1]["collateralAmount"] ?? 0n,
      collateralToken?.decimals ?? 0
    )
  );

  const { data: successData } = useWaitForTransactionReceipt({
    hash: (successLoanHash as Address) ?? "0x",
    query: {
      enabled: !!successLoanHash,
    },
  });

  const config = contracts?.[SupportedContractsEnum.TellerV2].abi;

  let decodedLog: any;
  let _bidId;
  if (successData) {
    decodedLog = decodeEventLog({
      abi: config,
      topics: successData?.logs?.[0]?.topics,
      data: successData?.logs?.[0]?.data,
      strict: false,
    });
    _bidId = decodedLog?.args?.bidId;
    setBidId(_bidId);
  }

  return (
    <div className="borrow-confirmation">
      <img
        src={confirmationBackground}
        className="borrow-confirmation-background"
      />
      {/*<img src={confirmationAsset} className="borrow-confirmation-main-image" />*/}
      <div className="borrow-confirmation-title">
        {isStrategiesSection
          ? isShort
            ? `Shorted ${formattedPrincipalAmount} ${principalToken?.symbol}`
            : isLong
            ? `Longed ${formattedLongTokenAmount} ${selectedSwapToken?.symbol}`
            : ""
          : `Borrowed ${formattedPrincipalAmount} ${principalToken?.symbol}`}{" "}
        with {formattedCollateralAmount} {collateralToken?.symbol} as collateral
      </div>
      <div className="borrow-confirmation-buttons">
        {!bidId ? (
          <div className="loader-container">
            <Loader isSkeleton height={40} />
            <Loader isSkeleton height={40} />
            <Loader isSkeleton height={40} />
          </div>
        ) : (
          <>
            <Button isFullWidth variant="secondary">
              <a
                href={`${chainExplorerURL}/tx/${successLoanHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View tx" />
              </a>
            </Button>
            <Button isFullWidth variant="secondary">
              <a
                href={`https://app.teller.org/${normalizeChainName(
                  chainName
                )}/loan/${bidId}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View cash advance" />
              </a>
            </Button>
            <Button
              label={"Set payment reminder"}
              isFullWidth
              variant="primary"
              onClick={() => setCurrentStep(BorrowSectionSteps.ADD_TO_CALENDAR)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BorrowConfirmation;
