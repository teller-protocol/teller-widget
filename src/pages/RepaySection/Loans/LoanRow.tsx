import React, { useMemo } from "react";

import danger from "../../../assets/danger.svg";
import defaulted from "../../../assets/default.svg";
import healthy from "../../../assets/healthy.svg";

import { formatUnits } from "viem";
import Button from "../../../components/Button";
import Loader from "../../../components/Loader";
import { SUPPORTED_TOKEN_LOGOS } from "../../../constants/tokens";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import {
  Loan,
  LoanStatus,
} from "../../../hooks/queries/useGetActiveLoansForUser";
import { useGetTokenMetadata } from "../../../hooks/useGetTokenMetadata";
import { formatTimestampToShortDate } from "../../../helpers/dateUtils";
import {
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "../RepaySectionContext";
import { useGetRolloverableCommitments } from "../../../hooks/queries/useGetRolloverableCommitments";
import Tooltip from "../../../components/Tooltip";
import StatusBadge from "../../../components/StatusBadge";
import { LoanStatusType } from "../../../components/StatusBadge/StatusBadge";

interface LoanRowProps {
  loan: Loan;
}

interface TokenPairProps {
  principalTokenAddress: string;
  collateralTokenAdress: string;
}

const TokenPair: React.FC<TokenPairProps> = ({
  principalTokenAddress,
  collateralTokenAdress,
}) => {
  const { setCollateralImageURL } = useGetRepaySectionContext();
  const {
    tokenMetadata: collateralTokenMetadata,
    isLoading: collateralLoading,
  } = useGetTokenMetadata(collateralTokenAdress, setCollateralImageURL);

  const { tokenMetadata: principalTokenMetadata, isLoading: principalLoading } =
    useGetTokenMetadata(principalTokenAddress, setCollateralImageURL);

  const collateralTokenLogo = useMemo(() => {
    return collateralTokenMetadata?.logo;
  }, [collateralTokenMetadata]);

  const principalTokenLogo = useMemo(() => {
    return principalTokenMetadata?.logo;
  }, [principalTokenMetadata]);

  const isLoading = collateralLoading || principalLoading;

  return (
    <>
      {isLoading ? (
        <Loader height={20} isSkeleton />
      ) : (
        <div className="token-pair">
          <img src={principalTokenLogo ?? ""} alt={principalTokenAddress} />
          <img src={collateralTokenLogo ?? ""} alt={collateralTokenAdress} />
        </div>
      )}
    </>
  );
};

export const LoanRow: React.FC<LoanRowProps> = ({ loan }) => {
  const collateralTokenAddress = loan.collateral[0].collateralAddress;
  const { setCurrentStep, setLoan } = useGetRepaySectionContext();

  const { hasRolloverableCommitments, isLoading } =
    useGetRolloverableCommitments(
      collateralTokenAddress,
      loan.lendingToken.address
    );

  const handleOnPayClick = () => {
    setLoan(loan);
    setCurrentStep(RepaySectionSteps.REPAY_LOAN);
  };

  const handleOnExtendClick = () => {
    setLoan(loan);
    setCurrentStep(RepaySectionSteps.ROLLOVER_LOAN);
  };

  const { setCollateralImageURL } = useGetRepaySectionContext();

  useGetTokenMetadata(collateralTokenAddress, setCollateralImageURL);

  return (
    <div className="loans-table-row">
      <div className="loans-table-row-data">
        <StatusBadge status={loan.status.toLowerCase() as LoanStatusType} />
        <div className="loan-amount">
          <div className="token-info">
            {numberWithCommasAndDecimals(
              formatUnits(BigInt(loan.principal), loan.lendingToken.decimals)
            )}{" "}
            <TokenPair
              principalTokenAddress={loan.lendingToken.address}
              collateralTokenAdress={collateralTokenAddress}
            />
          </div>
        </div>
        <div>
          <Tooltip
            description="mm/dd/yyyy"
            icon={formatTimestampToShortDate(loan.nextDueDate)}
          />
        </div>
      </div>
      <div className="loans-table-row-buttons">
        {isLoading ? (
          <Loader height={33} isSkeleton />
        ) : (
          <>
            <Button
              label="Pay"
              onClick={handleOnPayClick}
              variant={hasRolloverableCommitments ? "secondary" : "primary"}
            />
            {hasRolloverableCommitments && (
              <Button label="Extend" onClick={handleOnExtendClick} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
