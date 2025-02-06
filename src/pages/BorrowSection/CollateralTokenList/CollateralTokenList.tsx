import React from "react";
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

  const sortedTokens = [
    ...tokensWithCommitments
      .filter((token) => parseFloat(token.balance) > 0)
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokensWithCommitments
      .filter((token) => parseFloat(token.balance) <= 0)
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
  ];
  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          <div className="section-title">
            Select token collateral for deposit:
          </div>
          {loading ? (
            <Loader />
          ) : sortedTokens.length > 0 ? (
            sortedTokens.map((token) => (
              <CollateralTokenRow
                token={token}
                onClick={() => onCollateralTokenSelected(token)}
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
