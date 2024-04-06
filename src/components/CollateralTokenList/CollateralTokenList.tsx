import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";
import { UserToken } from "../../hooks/useGetUserTokens";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../../pages/BorrowSection/BorrowSectionContext";

import CollateralTokenRow from "../CollateralTokenRow";
import Loader from "../Loader";
import "./collateralTokenList.scss";

const CollateralTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedCollateralToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
  } = useGetBorrowSectionContext();

  const onCollateralTokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedCollateralToken(token);
  };

  return (
    <div className="collateral-token-list">
      <span className="section-title">Select token collateral for deposit</span>
      {loading ? (
        <Loader />
      ) : tokensWithCommitments.length > 0 ? (
        tokensWithCommitments.map((token) => (
          <CollateralTokenRow
            token={token}
            onClick={onCollateralTokenSelected}
            key={token.address.toString()}
          />
        ))
      ) : (
        <div className="section-title">No tokens available</div>
      )}
    </div>
  );
};

export default CollateralTokenList;
