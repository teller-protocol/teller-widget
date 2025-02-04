import React, { useState } from "react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const isSupportedChain = useIsSupportedChain();

  const onCollateralTokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedCollateralToken(token);
  };

  const filteredAndSortedTokens = [
    ...tokensWithCommitments
      .filter((token) => parseFloat(token.balance) > 0 && 
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokensWithCommitments
      .filter((token) => parseFloat(token.balance) <= 0 && 
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
  ];

  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          <input
            type="text"
            placeholder="Select collateral for deposit"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="token-search-input" style={{fontSize: '16px'}}
          />
          {loading ? (
            <Loader />
          ) : filteredAndSortedTokens.length > 0 ? (
            filteredAndSortedTokens.map((token) => (
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