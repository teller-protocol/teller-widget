import React, { useMemo, useState, useEffect } from "react";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import Loader from "../../../components/Loader";
import {
  useGetBorrowSectionContext,
  BorrowSectionSteps,
} from "../BorrowSectionContext";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import { UserToken } from "../../../hooks/useGetUserTokens";
import "./swapTokenList.scss";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useGetTokenList } from "../../../hooks/queries/useGetTokenList";
import { AddressStringType } from "../../../types/addressStringType";
import { arbitrum, base, mainnet, polygon } from "viem/chains";
import { useGetTokensData } from "../../../hooks/useFetchTokensData";
import { getTokenChain } from "../../../hooks/useGetTokenChain";

const SwapTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedSwapToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
  } = useGetBorrowSectionContext();

  const [searchQuery, setSearchQuery] = useState("");
  const isSupportedChain = useIsSupportedChain();

  const { fetchAllWhitelistedTokensData } = useGetTokensData();

  const { address } = useAccount();

  const { switchChain } = useSwitchChain();

  const onSwapTokenSelected = (token: UserToken) => {
    window.dispatchEvent(
      new CustomEvent("teller-widget-opportunity-selected", {
        detail: {
          token: token.address,
        },
      })
    );
    token.chainId && switchChain({ chainId: token.chainId });
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    setSelectedSwapToken(token);
  };

  const { data: tokenList } = useGetTokenList();
  const chainId = useChainId();

  const uniswapChainTokens = tokenList?.[chainId] || [];

  const allTokens = [
    ...(uniswapChainTokens.length > 0
      ? [
          ...tokenList?.[mainnet.id],
          ...tokenList?.[polygon.id],
          ...tokenList?.[base.id],
          ...tokenList?.[arbitrum.id],
        ]
      : []),
  ];

  const uniswapTokens = address ? uniswapChainTokens : allTokens;
  const userTokenAddresses = useMemo(
    () => tokensWithCommitments.map((t) => t?.address?.toLowerCase()),
    [tokensWithCommitments]
  );

  const additionalTokens: UserToken[] = useMemo(() => {
    return uniswapTokens
      .filter(
        (token) => !userTokenAddresses.includes(token?.address.toLowerCase())
      )
      .map((token) => ({
        address: token.address as AddressStringType,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logoURI,
        balance: "0",
        balanceBigInt: 0n,
        chainId: !address ? token.chainId : undefined,
      }));
  }, [uniswapTokens, userTokenAddresses, address]);

  const mergedTokens = useMemo(() => {
    return Array.from(
      new Map(
        [...tokensWithCommitments, ...additionalTokens].map((t) => [
          t?.address?.toLowerCase(),
          t,
        ])
      )
    ).map(([, token]) => token);
  }, [tokensWithCommitments, additionalTokens]);

  const [filteredAndSortedTokens, setFilteredAndSortedTokens] = useState<
    UserToken[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    const filterTokens = async () => {
      let tokens = [
        ...mergedTokens
          .filter(
            (token) =>
              parseFloat(token?.balance) > 0 &&
              token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .sort((a, b) => a.symbol.localeCompare(b.symbol)),
        ...mergedTokens
          .filter(
            (token) =>
              parseFloat(token?.balance) <= 0 &&
              token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .sort((a, b) => a.symbol.localeCompare(b.symbol)),
      ];

      if (tokens.length === 0 && searchQuery.length > 0) {
        const chainId = await getTokenChain(searchQuery);
        tokens = await fetchAllWhitelistedTokensData([searchQuery], chainId);
      }

      if (
        isMounted &&
        (filteredAndSortedTokens.length !== tokens.length ||
          !filteredAndSortedTokens.every(
            (t, i) => t.address === tokens[i]?.address
          ))
      ) {
        setFilteredAndSortedTokens(tokens);
      }
    };

    void filterTokens();

    return () => {
      isMounted = false;
    };
  }, [
    chainId,
    fetchAllWhitelistedTokensData,
    filteredAndSortedTokens,
    mergedTokens,
    searchQuery,
  ]);

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
