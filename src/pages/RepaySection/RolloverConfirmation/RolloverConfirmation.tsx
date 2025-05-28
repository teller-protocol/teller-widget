import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import confirmationBackground from "../../../assets/confirmation_background.png";
import externalLink from "../../../assets/external_link.svg";
import Button from "../../../components/Button";

import { Address, formatUnits, fromHex } from "viem";
import Loader from "../../../components/Loader";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useChainData } from "../../../hooks/useChainData";
import {
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "../RepaySectionContext";
import "./rolloverConfirmation.scss";
import { normalizeChainName } from "../../../constants/chains";

const LabelWithIcon = ({ label }: { label: string }) => (
  <div className="label-with-icon">
    {label} <img src={externalLink} />
  </div>
);

const RolloverConfirmation = () => {
  const {
    successRolloverLoanHash,
    rolloverCommitment,
    setBidId,
    setCurrentStep,
    successfulLoanParams,
    bidId,
  } = useGetRepaySectionContext();

  const { chainExplorerURL, chainName } = useChainData();

  const principalToken = rolloverCommitment?.principalToken;
  const collateralToken = rolloverCommitment?.collateralToken;

  const formattedPrincipalAmount = numberWithCommasAndDecimals(
    formatUnits(
      successfulLoanParams.args[6].principalAmount,
      principalToken?.decimals ?? 0
    )
  );

  const formattedCollateralAmount = numberWithCommasAndDecimals(
    formatUnits(
      successfulLoanParams.args[6].collateralAmount,
      collateralToken?.decimals ?? 0
    )
  );

  const { data: successData } = useWaitForTransactionReceipt({
    hash: (successRolloverLoanHash as Address) ?? "0x",
    query: {
      enabled: !!successRolloverLoanHash,
    },
  });

  useEffect(() => {
    if (successData) {
      const topicData = successData.logs?.[10]?.topics?.[1];
      if (topicData && topicData !== "0x") {
        const extractedBidId = fromHex(topicData, "number");
        setBidId(extractedBidId.toString());
      }
    }
  }, [successData, setBidId]);

  return (
    <div className="rollover-confirmation">
      <img
        src={confirmationBackground}
        className="rollover-confirmation-background"
      />
      <div className="rollover-confirmation-title">
        Borrowed {formattedPrincipalAmount} {principalToken?.symbol} with{" "}
        {formattedCollateralAmount} {collateralToken?.symbol} as collateral
      </div>
      <div className="rollover-confirmation-buttons">
        {!successRolloverLoanHash ? (
          <div className="loader-container">
            <Loader isSkeleton height={40} />
            <Loader isSkeleton height={40} />
            <Loader isSkeleton height={40} />
          </div>
        ) : (
          <>
            <Button isFullWidth variant="secondary">
              <a
                href={`${chainExplorerURL}/tx/${successRolloverLoanHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View transaction" />
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
              onClick={() =>
                setCurrentStep(RepaySectionSteps.ADD_ROLLOVER_TO_CALENDAR)
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RolloverConfirmation;
