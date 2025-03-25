import React, { useState } from "react";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import LongErc20TokenRow from "../../../components/LongErc20Row";
import Loader from "../../../components/Loader";
import { 
  useGetGlobalPropsContext, 
  STRATEGY_ACTION_ENUM 
} from "../../../contexts/GlobalPropsContext";
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

  const { isStrategiesSection, strategyAction, setStrategyAction } = useGetGlobalPropsContext();

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

  const handleStrategyAction = (action: STRATEGY_ACTION_ENUM) => {
    setKey((prev) => prev + 1);
    setStrategyAction(action);
  };
  
  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          {isStrategiesSection && (
            <div className="select-button-list">
              <SelectButtons
                items={[
                  { value: STRATEGY_ACTION_ENUM.LONG, content: "Long ↗️" },
                  { value: STRATEGY_ACTION_ENUM.SHORT, content: "Short ↘️" },
                  { value: STRATEGY_ACTION_ENUM.FARM, content: "Farm 🚜" }
                ]}
                value={strategyAction ?? ""}
                onChange={handleStrategyAction}
              />
            </div>
          )}
          {!isStrategiesSection && (
            <div className="search-and-buttons">
              <input
                type="text"
                placeholder={
                  isStrategiesSection ? "Tokens to borrow" : "Collateral to deposit for loan"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="token-search-input"
              />
            </div>
          )}
          {isStrategiesSection ? (
            erc20Loading ? (
              <Loader />
            ) : strategyAction === STRATEGY_ACTION_ENUM.FARM ? (
              <PrincipalErc20List searchQuery={searchQuery} />
            ) : strategyAction === STRATEGY_ACTION_ENUM.SHORT ? (
              <ShortErc20List searchQuery={searchQuery} />
            ) : (
              filteredAndSortedTokens.length > 0 ? (
                filteredAndSortedTokens.map((token) => (
                  <LongErc20TokenRow
                    token={token}
                    onClick={() => onCollateralTokenSelected(token)}
                    key={token.address.toString()}
                  />
                ))
              ) : (
                <div className="section-title">No tokens available</div>
              )
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
