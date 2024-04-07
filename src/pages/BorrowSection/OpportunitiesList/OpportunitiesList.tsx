import React from "react";
import TokenDropdown from "../../../components/TokenDropdown";
import {
  CommitmentType,
  useGetCommitmentsForCollateralToken,
} from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { useGetBorrowSectionContext } from "../BorrowSectionContext";

import "./opportunitiesList.scss";

import caret from "../../../assets/right-caret.svg";

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
  return (
    <div className="opportunity-list-item">
      <div className="paragraph opportunity-list-item-header">
        <div>
          Deposit <b>15 {opportunity.collateralToken?.symbol}</b> to borrow{" "}
        </div>
        <img src={caret} />
      </div>
      <div className="opportunity-list-item-body">
        <OpportunityListDataItem
          label="APR"
          value={`${Number(opportunity.minAPY) / 100} %`}
        />
        <OpportunityListDataItem
          label="Duration"
          value={`${Number(opportunity.maxDuration) / 86400} days`}
        />
        <OpportunityListDataItem label="Points" value="123 points" />
      </div>
    </div>
  );
};

const OpportunitiesList: React.FC = () => {
  const { selectedCollateralToken, tokensWithCommitments } =
    useGetBorrowSectionContext();
  const { data } = useGetCommitmentsForCollateralToken(
    selectedCollateralToken?.address
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
