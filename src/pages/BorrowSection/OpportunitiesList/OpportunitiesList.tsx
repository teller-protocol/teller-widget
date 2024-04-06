import {
  CommitmentType,
  useGetCommitmentsForCollateralToken,
} from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { UserToken } from "../../../hooks/useGetUserTokens";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import { useGetBorrowSectionContext } from "../BorrowSectionContext";
import TokenDropdown from "../../../components/TokenDropdown";

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
            <span>My token collateral</span>
            <TokenDropdown
              tokens={tokensWithCommitments}
              selectedToken={selectedCollateralToken}
            />
          </>
        )}
      </div>
      {data && (
        <div className="opportunities-list-body">
          {data.commitments.map((commitment) => (
            <OpportunityListItem opportunity={commitment} key={commitment.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
