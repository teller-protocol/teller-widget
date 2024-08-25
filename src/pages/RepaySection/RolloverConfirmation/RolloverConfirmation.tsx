import { useWaitForTransactionReceipt } from "wagmi";
import confirmationAsset from "../../../assets/confirmation.svg";
import confirmationBackground from "../../../assets/confirmation_background.png";
import externalLink from "../../../assets/external_link.svg";
import Button from "../../../components/Button";

import { decodeEventLog, formatUnits } from "viem";
import Loader from "../../../components/Loader";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useChainData } from "../../../hooks/useChainData";
import { useContracts } from "../../../hooks/useContracts";
import { SupportedContractsEnum } from "../../../hooks/useReadContract";
import {
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "../RepaySectionContext";
import "./rolloverConfirmation.scss";
import RepaySection from "../RepaySection";

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
    bidId,
    setCurrentStep,
    successfulLoanParams,
  } = useGetRepaySectionContext();
  const contracts = useContracts();

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

  /*   const { data: successData } = useWaitForTransactionReceipt({
    hash: (successRolloverLoanHash as AddressStringType) ?? "0x",
    query: {
      enabled: !!successRolloverLoanHash,
    },
  }); */

  const config = contracts?.[SupportedContractsEnum.FlashRolloverLoan].abi;

  let decodedLog;
  let _bidId;
  // if (successData) {
  //   decodedLog = decodeEventLog({
  //     abi: config,
  //     topics: successData?.logs?.[0]?.topics,
  //     data: successData?.logs?.[0]?.data,
  //     strict: false,
  //   });
  //   _bidId = decodedLog?.args?.bidId;
  //   setBidId(_bidId);
  // }

  return (
    <div className="rollover-confirmation">
      <img
        src={confirmationBackground}
        className="rollover-confirmation-background"
      />
      {/*<img src={confirmationAsset} className="rollover-confirmation-main-image"/>*/}
      <div className="rollover-confirmation-title">
        Borrowed {formattedPrincipalAmount} {principalToken?.symbol} with{" "}
        {formattedCollateralAmount} {collateralToken?.symbol} as collateral
      </div>
      <div className="rollover-confirmation-buttons">
        {!successRolloverLoanHash ? (
          <div className="loader-container">
            <Loader isSkeleton height={40} />
            {/* <Loader isSkeleton height={40} />
            <Loader isSkeleton height={40} /> */}
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
            {/*<Button isFullWidth variant="primary">
              <a
                href={`https://app.teller.org/${chainName?.toLocaleLowerCase()}/loan/${bidId}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View cash advance" />
              </a>
            </Button>*/}
            {/* <Button
              label={"Set payment reminder"}
              isFullWidth
              onClick={() => setCurrentStep(RepaySectionSteps.ADD_TO_CALENDAR)}
            /> */}
          </>
        )}
      </div>
    </div>
  );
};

export default RolloverConfirmation;
