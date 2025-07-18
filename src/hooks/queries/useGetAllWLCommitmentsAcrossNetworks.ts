import { useQueries } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { arbitrum, base, mainnet, polygon } from "viem/chains";

import { getGraphEndpointWithKey } from "../../constants/graphEndpoints";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useGetTokensData } from "../useFetchTokensData";

const cacheKeyPrefix = (cacheKey: string) =>
  cacheKey
    ? `commitmentsAcrossNetworks-${cacheKey}`
    : "commitmentsAcrossNetworks";
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

type CachedCommitments = {
  data: any[];
  timestamp: number;
  whitelistedTokensFingerprint: string;
};

type CommitmentsCache = CachedCommitments | null;

const commitmentsQuery = (tokens: string[]) => gql`
  query commitmentsForUserTokensALLWLTokens {
    commitments(
      where: { collateralToken_: { address_in: ${JSON.stringify(
        Array.from(new Set(tokens))
      )}}, status: "Active", committedAmount_gt: "0" }
    ) {
      collateralToken {
        address
      }
    }
  }
`;

const liquidityPoolsQuery = (tokens: string[]) => gql`
        query checkCommitmentsLenderGroupsALLWLTokens {
          group_pool_metric(
            where: {
              collateral_token_address: {_in: ${JSON.stringify(
                Array.from(new Set(tokens))
              )}}
            }
          ) {
            group_pool_address
            collateral_token_address
          }
        }
      `;

export const useGetAllWLCommitmentsAcrossNetworks = () => {
  const { subgraphApiKey, whitelistedTokens, cacheKey } =
    useGetGlobalPropsContext();
  const { fetchAllWhitelistedTokensData } = useGetTokensData();

  const [allCommitments, setAllCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<CommitmentsCache>(null);

  const mainnetID = mainnet.id;
  const polygonID = polygon.id;
  const arbitrumID = arbitrum.id;
  const baseID = base.id;

  const subpgraphIds = useMemo(
    () => [mainnetID, polygonID, arbitrumID, baseID],
    [mainnetID, polygonID, arbitrumID, baseID]
  );

  const whitelistedTokensFingerprint = useMemo(() => {
    return subpgraphIds
      .map((id) => {
        const tokens = whitelistedTokens?.[id] || [];
        return `${id}:${tokens.join(",")}`;
      })
      .join("|");
  }, [whitelistedTokens, subpgraphIds]);

  // Load cache from localStorage once
  useEffect(() => {
    const lsItem = localStorage.getItem(cacheKeyPrefix(cacheKey));
    if (lsItem) {
      try {
        const parsed: CommitmentsCache = JSON.parse(lsItem);
        setCache(parsed);
      } catch (e) {
        console.error("Failed to parse localStorage cache:", e);
      }
    }
  }, [cacheKey]);

  // Persist cache to localStorage on change
  useEffect(() => {
    localStorage.setItem(cacheKeyPrefix(cacheKey), JSON.stringify(cache));
  }, [cache, cacheKey]);

  const result = useQueries({
    queries: subpgraphIds.map((id) => ({
      queryKey: [
        "teller-widget",
        "commitments",
        id,
        whitelistedTokensFingerprint,
      ],
      queryFn: async () => {
        const tokens = whitelistedTokens?.[id] || [];
        let commitments: any;
        let liquidityPools: any;

        try {
          commitments = await request(
            getGraphEndpointWithKey(subgraphApiKey, id) ?? "",
            commitmentsQuery(tokens)
          );
        } catch (error) {
          console.error(`Error fetching commitments for chain ${id}:`, error);
          return [];
        }

        try {
          liquidityPools = await request(
            getLiquidityPoolsGraphEndpoint(id) ?? "",
            liquidityPoolsQuery(tokens)
          );
        } catch (error) {
          console.error(
            `Error fetching liquidity pools for chain ${id}:`,
            error
          );
          return [];
        }

        const commitmentsWithCollateralAddressOnly =
          commitments?.commitments?.map(
            (commitment: { collateralToken: { address: string } }) =>
              commitment?.collateralToken?.address
          ) || [];

        const liquidityPoolsWithCollateralAddressOnly =
          liquidityPools?.group_pool_metric?.map(
            (pool: { collateral_token_address: string }) =>
              pool.collateral_token_address
          ) || [];

        const combinedCommitments = Array.from(
          new Set([
            ...commitmentsWithCollateralAddressOnly,
            ...liquidityPoolsWithCollateralAddressOnly,
          ])
        );

        const commitmentsWithData = await fetchAllWhitelistedTokensData(
          combinedCommitments,
          id
        );

        return commitmentsWithData;
      },
      enabled: !!whitelistedTokensFingerprint,
      keepPreviousData: true,
    })),
    combine: (results) => {
      const allData = results.flatMap((d) => d.data);
      const allDataFetched = results.every((d) => d.isSuccess);
      const isLoading = results.some((d) => d.isLoading);

      return {
        data: allData,
        loading: isLoading,
        isFetched: allDataFetched,
      };
    },
  });

  // Update in-memory cache when new commitments are available
  useEffect(() => {
    if (!loading && result.isFetched && result.data.length > 0) {
      setCache({
        data: result.data,
        timestamp: Date.now(),
        whitelistedTokensFingerprint,
      });
    }
  }, [result.data, result.isFetched, loading, whitelistedTokensFingerprint]);

  // Process and set commitments
  useEffect(() => {
    if (!whitelistedTokensFingerprint) {
      setLoading(false);
      return;
    }

    if (result.isFetched) {
      setAllCommitments(result.data);
      setLoading(false);
    }
  }, [result.data, result.isFetched, whitelistedTokensFingerprint]);

  const cachedCommitments = useMemo(() => {
    if (!cache) return [];

    const isFresh = Date.now() - cache.timestamp < CACHE_TIME;
    const isSameFingerprint =
      cache.whitelistedTokensFingerprint === whitelistedTokensFingerprint;

    // On initial load when whitelistedTokens is empty, use cached data if it's fresh
    const isInitialLoad = !whitelistedTokensFingerprint;

    // If whitelistedTokens have loaded and fingerprint changed, don't use cache
    if (whitelistedTokensFingerprint && !isSameFingerprint) return [];

    return isFresh && (isSameFingerprint || isInitialLoad) ? cache.data : [];
  }, [cache, whitelistedTokensFingerprint]);

  return useMemo(() => {
    const isUsingCache = cachedCommitments.length > 0;
    const isInitialLoad = !!whitelistedTokensFingerprint;

    return {
      data: isUsingCache ? cachedCommitments : allCommitments,
      loading: isUsingCache
        ? false
        : (isInitialLoad ? false : loading) || !result.isFetched,
    };
  }, [
    allCommitments,
    cachedCommitments,
    loading,
    result.isFetched,
    whitelistedTokensFingerprint,
  ]);
};
