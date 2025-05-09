import React, { useState } from "react";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import Loader from "../../../components/Loader";
import {
  useGetBorrowSectionContext,
  BorrowSectionSteps,
} from "../BorrowSectionContext";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import { UserToken } from "../../../hooks/useGetUserTokens";
import "./swapTokenList.scss";
import { useChainId } from "wagmi";
import { useGetTokenList } from "../../../hooks/queries/useGetTokenList";
import { AddressStringType } from "../../../types/addressStringType";

const SwapTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedSwapToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
  } = useGetBorrowSectionContext();

  const [searchQuery, setSearchQuery] = useState("");
  const isSupportedChain = useIsSupportedChain();

  const onSwapTokenSelected = (token: UserToken) => {
    window.dispatchEvent(
      new CustomEvent("teller-widget-opportunity-selected", {
        detail: {
          token: token.address,
        },
      })
    );
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    setSelectedSwapToken(token);
  };

  const { data: tokenList } = useGetTokenList();
  const chainId = useChainId();

  const uniswapTokens = tokenList?.[chainId] || [];

  const userTokenAddresses = new Set(
    tokensWithCommitments.map((t) => t.address.toLowerCase())
  );

  const additionalTokens: UserToken[] = uniswapTokens
    .filter((token) => !userTokenAddresses.has(token.address.toLowerCase()))
    .map((token) => ({
      address: token.address as AddressStringType,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logo: token.logoURI,
      balance: "0",
      balanceBigInt: 0n,
    }));

  const mergedTokens = Array.from(
    new Map(
      [...tokensWithCommitments, ...additionalTokens].map((t) => [
        t.address.toLowerCase(),
        t,
      ])
    )
  ).map(([, token]) => token);

  const filteredAndSortedTokens = [
    ...mergedTokens
      .filter(
        (token) =>
          parseFloat(token.balance) > 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...mergedTokens
      .filter(
        (token) =>
          parseFloat(token.balance) <= 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
  ];

  return (
    <div className="swap-token-list">
      {isSupportedChain ? (
        <div>
          <div className="search-and-buttons">
            <input
              type="text"
              placeholder="Select token to long"
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
                onClick={() => onSwapTokenSelected(token)}
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

export default SwapTokenList;
