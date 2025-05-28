import React, { useState } from "react";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import Loader from "../../../components/Loader";
import {
  useGetGlobalPropsContext,
  STRATEGY_ACTION_ENUM,
} from "../../../contexts/GlobalPropsContext";
import { UserToken } from "../../../hooks/useGetUserTokens";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import PrincipalErc20List from "../../../pages/BorrowSection/PrincipalErc20List";
import ShortErc20List from "../../../pages/BorrowSection/ShortErc20List";
import SwapTokenList from "../../../pages/BorrowSection/SwapTokenList";

import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import "./collateralTokenList.scss";
import SelectButtons from "../../../components/SelectButtons";
import { useAccount, useChainId } from "wagmi";
import TokenLogo from "../../../components/TokenLogo";
import defaultTokenImage from "../../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { mapChainIdToName } from "../../../constants/chains";
import { mapChainToImage } from "../../../components/ChainSwitch/ChainSwitch";

export enum BORROW_TOKEN_TYPE_ENUM {
  STABLE = "STABLE",
  ERC20 = "ERC20",
}

const SelectedCollateralTokenRow: React.FC<{ token: UserToken }> = ({
  token,
}) => {
  const logoUrl = token?.logo ? token.logo : defaultTokenImage;

  return (
    <div className="selected-collateral-token">
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">Long {token?.symbol}</span>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Balance: ${numberWithCommasAndDecimals(token?.balance)} ${
              token?.symbol
            }`
          )}
        </span>
      </div>
    </div>
  );
};

export const StrategiesSelect: React.FC<{
  renderFlag?: boolean;
  showStrategy: boolean;
  value: string;
  onValueChange: (value: STRATEGY_ACTION_ENUM) => void;
}> = ({ renderFlag, showStrategy, value, onValueChange }) => {
  const { setCurrentStep, setSelectedSwapToken } = useGetBorrowSectionContext();

  const handleOnChange = (value: STRATEGY_ACTION_ENUM) => {
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    setSelectedSwapToken(undefined);
    onValueChange(value);
  };

  if (renderFlag) {
    return (
      <div className="select-button-list">
        <SelectButtons
          items={[
            { value: STRATEGY_ACTION_ENUM.LONG, content: "Long ↗️" },
            {
              value: STRATEGY_ACTION_ENUM.SHORT,
              content: "Short ↘️",
            },
            ...(showStrategy
              ? [
                  {
                    value: STRATEGY_ACTION_ENUM.FARM,
                    content: "Farm 🚜",
                  },
                ]
              : []),
          ]}
          value={value}
          onChange={handleOnChange}
        />
      </div>
    );
  } else <></>;
};

const CollateralTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedCollateralToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
    erc20sWithCommitmentsLoading: erc20Loading,
    setSelectedSwapToken,
    selectedSwapToken,
  } = useGetBorrowSectionContext();

  const {
    isStrategiesSection,
    strategyAction,
    setStrategyAction,
    isTradeMode,
  } = useGetGlobalPropsContext();

  const [searchQuery, setSearchQuery] = useState("");

  const { address } = useAccount();

  const chainId = useChainId();
  const { address } = useAccount();

  const isLong =
    isStrategiesSection && strategyAction === STRATEGY_ACTION_ENUM.LONG;

  const isSupportedChain = useIsSupportedChain();

  const onCollateralTokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedCollateralToken(token);
  };

  const filteredAndSortedTokens = [
    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token?.balance ?? "0") > 0 &&
          token?.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token?.balance ?? "0") <= 0 &&
          token?.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .filter((token) => (isLong ? token.chainId === chainId : true)), // if long, match collateral token to chainId
  ].map((token) => ({
    ...token,
    chainId: address ? undefined : token.chainId,
  }));

  const handleStrategyAction = (action: string) => {
    setStrategyAction(action as STRATEGY_ACTION_ENUM);

    // Reset selected swap token when switching strategies
    setSelectedSwapToken(undefined);
  };

  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          <StrategiesSelect
            renderFlag={isStrategiesSection}
            showStrategy={!isTradeMode}
            value={strategyAction ?? ""}
            onValueChange={handleStrategyAction}
          />
          {selectedSwapToken && isStrategiesSection && (
            <SelectedCollateralTokenRow token={selectedSwapToken} />
          )}
          {!isStrategiesSection && (
            <div className="search-and-buttons">
              <input
                type="text"
                placeholder={
                  isStrategiesSection
                    ? "Tokens to borrow"
                    : "Collateral to deposit for loan"
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
            ) : strategyAction === STRATEGY_ACTION_ENUM.LONG &&
              !selectedSwapToken ? (
              <SwapTokenList />
            ) : (
              <>
                <div className="search-and-buttons">
                  <input
                    type="text"
                    placeholder="Collateral to deposit for loan"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="token-search-input"
                  />
                </div>
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
              </>
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
