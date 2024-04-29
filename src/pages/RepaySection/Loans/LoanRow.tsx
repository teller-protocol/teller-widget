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

interface LoanRowProps {
  loan: Loan;
}

const mapStatusToAsset = {
  [LoanStatus.DEFAULTED]: defaulted,
  [LoanStatus.ACCEPTED]: healthy,
  ["due soon"]: danger,
  [LoanStatus.LATE]: defaulted,
};

interface TokenPairProps {
  principalTokenSymbol: string;
  collateralTokenAdress: string;
}

const TokenPair: React.FC<TokenPairProps> = ({
  principalTokenSymbol,
  collateralTokenAdress,
}) => {
  const { tokenMetadata: collateralTokenMetadata, isLoading } =
    useGetTokenMetadata(collateralTokenAdress);

  const collateralTokenLogo = useMemo(() => {
    return collateralTokenMetadata?.logo;
  }, [collateralTokenMetadata]);

  const principalTokenLogo = SUPPORTED_TOKEN_LOGOS[principalTokenSymbol];

  return (
    <>
      {isLoading ? (
        <Loader height={20} isSkeleton />
      ) : (
        <div className="token-pair">
          <img src={principalTokenLogo} alt={principalTokenSymbol} />
          <img src={collateralTokenLogo ?? ""} alt={collateralTokenAdress} />
        </div>
      )}
    </>
  );
};

export const LoanRow: React.FC<LoanRowProps> = ({ loan }) => {
  const collateralTokenAddress = loan.collateral[0].collateralAddress;
  const { setCurrentStep, setLoan } = useGetRepaySectionContext();

  const handleOnPayClick = () => {
    setLoan(loan);
    setCurrentStep(RepaySectionSteps.REPAY_LOAN);
  };

  return (
    <div className="loans-table-row">
      <img
        src={mapStatusToAsset[loan.status.toLowerCase()]}
        alt={loan.status}
      />
      <div className="loan-amount">
        <div>
          {numberWithCommasAndDecimals(
            formatUnits(BigInt(loan.principal), loan.lendingToken.decimals)
          )}
        </div>
        <TokenPair
          principalTokenSymbol={loan.lendingToken.symbol}
          collateralTokenAdress={collateralTokenAddress}
        />
      </div>
      <div>{formatTimestampToShortDate(loan.nextDueDate)}</div>
      <Button label="Pay" onClick={handleOnPayClick} />
    </div>
  );
};
