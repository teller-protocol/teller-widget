import {
  CommitmentType,
  useGetCommitmentsForCollateralToken,
} from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { UserToken } from "../../../hooks/useGetUserTokens";
import CollateralTokenRow from "../../CollateralTokenRow";

interface OpportunitiesListProps {
  selectedCollateral?: UserToken;
  onOpportunityClick: (v: any) => void;
}

interface OpportunityListItemProps {
  opportunity: CommitmentType;
}

const OpportunityListItem: React.FC<OpportunityListItemProps> = ({
  opportunity,
}) => {
  return (
    <div className="opportunity-list-item">
      <div className="opportunity-list-item-header">
        <span>{opportunity.principalToken?.symbol}</span>
        <span>{opportunity.minAPY}%</span>
      </div>
      <div className="opportunity-list-item-body">
        <span>Collateral: {opportunity.collateralToken?.symbol}</span>
        <span>Max duration: {opportunity.maxDuration} days</span>
        <span>Max principal: {opportunity.maxPrincipal}</span>
        <span>Committed amount: {opportunity.committedAmount}</span>
      </div>
    </div>
  );
};

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({
  selectedCollateral,
  onOpportunityClick,
}) => {
  const { data } = useGetCommitmentsForCollateralToken(
    selectedCollateral?.address
  );
  return (
    <div className="opportunities-list">
      <div className="opportunities-list-header">
        {selectedCollateral && (
          <>
            <span>My token collateral</span>
            <CollateralTokenRow token={selectedCollateral} />
          </>
        )}
      </div>
      {data && (
        <div className="opportunities-list-body">
          {data.commitments.map((commitment) => (
            <OpportunityListItem opportunity={commitment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
