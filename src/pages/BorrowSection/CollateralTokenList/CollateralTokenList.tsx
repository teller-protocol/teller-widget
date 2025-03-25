import React, { useState } from "react";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import Loader from "../../../components/Loader";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import { UserToken } from "../../../hooks/useGetUserTokens";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import PrincipalErc20List from "../../../pages/BorrowSection/PrincipalErc20List";
import ShortErc20List from "../../../pages/BorrowSection/ShortErc20List";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import "./collateralTokenList.scss";
import SelectButtons from "../../../components/SelectButtons";

export enum BORROW_TOKEN_TYPE_ENUM {
  STABLE = "STABLE",
  ERC20 = "ERC20",
}

const CollateralTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedCollateralToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
    erc20sWithCommitmentsLoading: erc20Loading,
  } = useGetBorrowSectionContext();

  const { isStrategiesSection } = useGetGlobalPropsContext();

  const [searchQuery, setSearchQuery] = useState("");

  const isSupportedChain = useIsSupportedChain();

  const [key, setKey] = useState(0);

  const onCollateralTokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedCollateralToken(token);
  };

  const filteredAndSortedTokens = [
    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token.balance) > 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token.balance) <= 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
  ];

  const handleWidgetAction = () => {
    setKey((prev) => prev + 1);
  };
  
  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          <div className="select-button-list">
            <SelectButtons
              items={[{value: "LONG",  content: "Long ↗️"}, {value: "SHORT",  content: "Short ↘️"}, {value: "FARM",  content: "Farm 🚜"}]}
              value={""}
              onChange={handleWidgetAction}
            />
          </div>
          <div className="search-and-buttons">
            <input
              type="text"
              placeholder={
                isStrategiesSection ? "Tokens to borrow" : "Collateral for loan"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="token-search-input"
            />
          </div>
          {isStrategiesSection ? (
            erc20Loading ? (
              <Loader />
            ) : (
              /*<PrincipalErc20List searchQuery={searchQuery} />*/
              <ShortErc20List searchQuery={searchQuery} />
            )
          ) : loading ? (
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
