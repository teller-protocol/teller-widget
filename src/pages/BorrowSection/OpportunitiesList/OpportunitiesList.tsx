import React, { useEffect, useState } from "react";
import TokenDropdown from "../../../components/TokenDropdown";
import {
  CommitmentType,
  useGetCommitmentsForCollateralToken,
} from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";

import "./opportunitiesList.scss";

import { formatUnits, parseUnits } from "viem";
import caret from "../../../assets/right-caret.svg";
import DataPill from "../../../components/DataPill";
import { SUPPORTED_TOKEN_LOGOS } from "../../../constants/tokens";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useGetCommitmentMax } from "../../../hooks/useGetCommitmentMax";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import { useAccount } from "wagmi";

interface OpportunityListItemProps {
  opportunity: CommitmentType;
}

interface OpportunityListDataItemProps {
  label: string;
  value: React.ReactNode;
}

const OpportunityListDataItem: React.FC<OpportunityListDataItemProps> = ({
  label,
  value,
}) => (
  <div className="opportunity-list-item-data">
    <div className="opportunity-list-item-data-label section-sub-title">
      {label}
    </div>
    <div className="opportunity-list-item-data-value">{value}</div>
  </div>
);

const OpportunityListItem: React.FC<OpportunityListItemProps> = ({
  opportunity,
}) => {
  const { setCurrentStep, setSelectedOpportunity, selectedCollateralToken } =
    useGetBorrowSectionContext();
  const { userTokens, isWhitelistedToken } = useGetGlobalPropsContext();

  const [collateralAmount, setCollateralAmount] = useState<bigint | undefined>(
    (selectedCollateralToken?.balanceBigInt ?? 0) > 0
      ? selectedCollateralToken?.balanceBigInt
      : isWhitelistedToken(opportunity.collateralToken?.address)
      ? BigInt(parseUnits("1", opportunity.collateralToken?.decimals ?? 0))
      : BigInt(0)
  );

  const commitmentMax = useGetCommitmentMax({
    commitment: opportunity,
    requestedCollateral: collateralAmount,
    collateralTokenDecimals: opportunity.collateralToken?.decimals,
  });

  // TODO: ADD SOCIAL FI CONDITIONAL
  useEffect(() => {
    commitmentMax.maxCollateral > 0 &&
      setCollateralAmount(commitmentMax.maxCollateral);
  }, [commitmentMax.maxCollateral]);

  const displayCollateralAmountData = {
    formattedAmount: numberWithCommasAndDecimals(
      Number(
        formatUnits(
          commitmentMax.maxCollateral,
          opportunity.collateralToken?.decimals ?? 0
        )
      ).toFixed(2)
    ),
    token: userTokens.find(
      (token) => token.address === opportunity.collateralToken?.address
    )?.logo,
  };

  const displayLoanAmountData = {
    formattedAmount: numberWithCommasAndDecimals(
      Number(
        formatUnits(
          commitmentMax.maxLoanAmount,
          opportunity.principalToken?.decimals ?? 0
        )
      ).toFixed(2)
    ),
    token: SUPPORTED_TOKEN_LOGOS[opportunity.principalToken?.symbol as string],
  };

  const formatedCollateralAmount = Number(
    formatUnits(
      commitmentMax.maxCollateral,
      opportunity.collateralToken?.decimals ?? 0
    )
  ).toFixed(2);

  const formatedLoanAmount = Number(
    formatUnits(
      commitmentMax.maxLoanAmount,
      opportunity.principalToken?.decimals ?? 0
    )
  ).toFixed(2);

  const handleOnOpportunityClick = () => {
    setSelectedOpportunity(opportunity);
    setCurrentStep(BorrowSectionSteps.OPPORTUNITY_DETAILS);
  };

  return (
    <div className="opportunity-list-item" onClick={handleOnOpportunityClick}>
      <div className="paragraph opportunity-list-item-header">
        Deposit{" "}
        <DataPill
          label={displayCollateralAmountData.formattedAmount}
          logo={displayCollateralAmountData.token}
        />{" "}
        to borrow{" "}
        <DataPill
          label={displayLoanAmountData.formattedAmount}
          logo={displayLoanAmountData.token}
        />
        <img src={caret} />
      </div>
      <div className="opportunity-list-item-body">
        <OpportunityListDataItem
          label="Interest"
          value={`${
            ((Number(opportunity.minAPY) / 100) * ((Number(opportunity.maxDuration) / 86400) / 365)).toFixed(2)
          } %`}
        />
        <OpportunityListDataItem
          label="Duration"
          value={`${Number(opportunity.maxDuration) / 86400} days`}
        />
      </div>
    </div>
  );
};

const OpportunitiesList: React.FC = () => {
  const { selectedCollateralToken, tokensWithCommitments } =
    useGetBorrowSectionContext();
  const { address: userAddress } = useAccount();
  const { data } = useGetCommitmentsForCollateralToken(
    selectedCollateralToken?.address,
    userAddress
  );

  return (
    <div className="opportunities-list">
      <div className="opportunities-list-header">
        {selectedCollateralToken && (
          <>
            <div className="section-title">My token collateral</div>
            <TokenDropdown
              tokens={tokensWithCommitments}
              selectedToken={selectedCollateralToken}
            />
          </>
        )}
      </div>
      {data && (
        <div className="opportunities-list-body">
          <div className="paragraph opportunities-sub-title">
            My opportunities
          </div>
          {data.commitments.map((commitment) => (
            <OpportunityListItem opportunity={commitment} key={commitment.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
