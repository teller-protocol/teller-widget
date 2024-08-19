import { useChainId, useChains, useWaitForTransactionReceipt } from "wagmi";
import confirmationAsset from "../../../assets/confirmation.svg";
import confirmationBackground from "../../../assets/confirmation_background.svg";
import externalLink from "../../../assets/external_link.svg";
import Button from "../../../components/Button";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";

import { Address, decodeEventLog, formatUnits } from "viem";
import Loader from "../../../components/Loader";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useContracts } from "../../../hooks/useContracts";
import { SupportedContractsEnum } from "../../../hooks/useReadContract";
import "./borrowConfirmation.scss";
import { useChainData } from "../../../hooks/useChainData";

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
  } = useGetBorrowSectionContext();
  const contracts = useContracts();

  const { chainExplorerURL, chainName } = useChainData();

  const principalToken = selectedOpportunity?.principalToken;
  const collateralToken = selectedOpportunity?.collateralToken;

  const formattedPrincipalAmount = numberWithCommasAndDecimals(
    formatUnits(successfulLoanParams.args[3], principalToken?.decimals ?? 0)
  );

  const formattedCollateralAmount = numberWithCommasAndDecimals(
    formatUnits(successfulLoanParams.args[4], collateralToken?.decimals ?? 0)
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
      <img src={confirmationAsset} className="borrow-confirmation-main-image" />
      <div className="borrow-confirmation-title">
        Borrowed {formattedPrincipalAmount} {principalToken?.symbol} with{" "}
        {formattedCollateralAmount} {collateralToken?.symbol} as collateral
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
                href={`https://app.teller.org/${chainName?.toLocaleLowerCase()}/loan/${bidId}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View cash advance" />
              </a>
            </Button>
            <Button
              label={"Set payment reminder"}
              isFullWidth
              onClick={() => setCurrentStep(BorrowSectionSteps.ADD_TO_CALENDAR)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BorrowConfirmation;
