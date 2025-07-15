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
import { CommitmentType } from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import "./collateralTokenList.scss";
import SelectButtons from "../../../components/SelectButtons";
import { useAccount, useChainId } from "wagmi";
import TokenLogo from "../../../components/TokenLogo";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { mapChainIdToName } from "../../../constants/chains";
import { mapChainToImage } from "../../../components/ChainSwitch/ChainSwitch";
import { useTokenLogoAndSymbolWithFallback } from "../../../hooks/useTokenLogoAndSymbolWithFallback";

export enum BORROW_TOKEN_TYPE_ENUM {
  STABLE = "STABLE",
  ERC20 = "ERC20",
}

const SelectedCollateralTokenRow: React.FC<{ token: UserToken }> = ({
  token,
}) => {
  const logoAndSymbol = useTokenLogoAndSymbolWithFallback(token);

  if (!logoAndSymbol) return null;

  return (
    <div className="selected-collateral-token">
      <TokenLogo logoUrl={logoAndSymbol.logo} size={32} />
      <div className="token-balance-info">
        <span className="paragraph">Long {logoAndSymbol.symbol}</span>
        <span className="section-sub-title">
          {token.chainId ? (
            <span className="chain-info-row">
              {mapChainIdToName[token.chainId]}
              <img src={mapChainToImage[token.chainId]} />
            </span>
          ) : (
            `Balance: ${numberWithCommasAndDecimals(token?.balance)} ${
              logoAndSymbol.symbol
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
  const {
    setCurrentStep,
    setSelectedSwapToken,
    setSelectedCollateralToken,
    setSelectedPrincipalErc20Token,
    setSelectedOpportunity,
  } = useGetBorrowSectionContext();

  const handleOnChange = (value: STRATEGY_ACTION_ENUM) => {
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    setSelectedSwapToken(undefined);
    setSelectedCollateralToken(undefined);
    setSelectedPrincipalErc20Token(undefined);
    setSelectedOpportunity({} as CommitmentType);
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
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
    loanRewards,
  } = useGetBorrowSectionContext();

  const {
    isStrategiesSection,
    strategyAction,
    setStrategyAction,
    isTradeMode,
    switchChainManual,
  } = useGetGlobalPropsContext();

  const [searchQuery, setSearchQuery] = useState("");

  const chainId = useChainId();
  const { address } = useAccount();

  const isLong =
    isStrategiesSection && strategyAction === STRATEGY_ACTION_ENUM.LONG;

  const isSupportedChain = useIsSupportedChain();

  const onCollateralTokenSelected = (token: UserToken) => {
    if (window.__adrsbl?.run) {
      const adrsblProperties = Object.entries(token).map(([key, value]) => ({
        name: key,
        value: value?.toString() ?? "",
      }));

      window.__adrsbl.run(
        "borrow_collateral_token_selected",
        false,
        adrsblProperties
      );
    }

    switchChainManual(token.chainId);
    setTimeout(() => {
      setSelectedCollateralToken(token);
      setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    });
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
        token?.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
        loanRewards.some(
          (reward) =>
            reward.network_id === token.chainId &&
            reward.collateral_address.toLowerCase() === token.address.toLowerCase()
        )
    )
    .sort((a, b) => {
      const rewardA = loanRewards.find(
        (r) =>
          r.network_id === a.chainId &&
          r.collateral_address.toLowerCase() === a.address.toLowerCase()
      );
      const rewardB = loanRewards.find(
        (r) =>
          r.network_id === b.chainId &&
          r.collateral_address.toLowerCase() === b.address.toLowerCase()
      );

      const percentA = rewardA?.reward_percent ?? 0;
      const percentB = rewardB?.reward_percent ?? 0;

      if (percentB !== percentA) {
        return percentB - percentA; // descending order of reward_percent
      }

      return a.symbol.localeCompare(b.symbol); // alphabetical fallback
    }),

    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token?.balance ?? "0") <= 0 &&
          token?.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !loanRewards.some(
            (reward) =>
              reward.network_id === token.chainId &&
              reward.collateral_address.toLowerCase() ===
                token.address.toLowerCase()
          )
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .filter((token) => (isLong ? token.chainId === chainId : true)),
  ].map((token) => {
    const matchingReward = loanRewards.find(
      (reward) =>
        reward.network_id === token.chainId &&
        reward.collateral_address.toLowerCase() === token.address.toLowerCase()
    );

    return {
      ...token,
      chainId: address ? undefined : token.chainId,
      rewardPercent: matchingReward?.reward_percent,
      rewardData: matchingReward ?? null,
    };
  });


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
                      onClick={onCollateralTokenSelected}
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
