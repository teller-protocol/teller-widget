import CollateralTokenRow from "../../../components/CollateralTokenRow";
import Loader from "../../../components/Loader";
import { UserToken } from "../../../hooks/useGetUserTokens";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import "./collateralTokenList.scss";

const CollateralTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedCollateralToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
  } = useGetBorrowSectionContext();

  const isSupportedChain = useIsSupportedChain();

  const onCollateralTokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedCollateralToken(token);
  };

  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          <div className="section-title">
            Select token collateral for deposit:{" "}
          </div>
          {loading ? (
            <Loader />
          ) : tokensWithCommitments.length > 0 ? (
            tokensWithCommitments
              .slice()
              .sort((a, b) => a.symbol.localeCompare(b.symbol))
              .map((token) => (
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
      ) : (
        <div className="unsupported-chain">This chain is not supported</div>
      )}
    </div>
  );
};

export default CollateralTokenList;
