import { useQueries } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { arbitrum, base, mainnet, polygon } from "viem/chains";

import { getGraphEndpointWithKey } from "../../constants/graphEndpoints";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { createFingerprintHash } from "../../helpers/localStorageCache";
import type { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useGetTokensData } from "../useFetchTokensData";
import type { UserToken } from "../useGetUserTokens";

interface Commitment {
  collateralToken: {
    address: string;
  };
}

type CachedCommitments = {
  data: UserToken[];
  timestamp: number;
  whitelistedTokensFingerprint: string;
};

type CommitmentsCache = CachedCommitments | null;

const cacheKeyPrefix = "commitmentsAcrossNetworks";
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

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

  const [allCommitments, setAllCommitments] = useState<UserToken[]>([]);
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
    let fingerprint = subpgraphIds
      .map((id) => {
        const tokens = whitelistedTokens?.[id] || [];
        return `${id}:${tokens.join(",")}`;
      })
      .join("|");

    if (cacheKey) fingerprint = `${cacheKey}//${fingerprint}`;

    return fingerprint;
  }, [whitelistedTokens, subpgraphIds, cacheKey]);

  // Create dynamic cache key based on whitelistedTokensFingerprint
  const dynamicCacheKey = useMemo(() => {
    if (!whitelistedTokensFingerprint) return `${cacheKeyPrefix}_empty`;
    const hash = createFingerprintHash(whitelistedTokensFingerprint);
    return `${cacheKeyPrefix}_${hash}`;
  }, [whitelistedTokensFingerprint]);

  // Load cache from localStorage when fingerprint changes
  useEffect(() => {
    const lsItem = localStorage.getItem(dynamicCacheKey);
    if (lsItem) {
      try {
        const parsed = JSON.parse(lsItem) as CommitmentsCache;
        setCache(parsed);
      } catch (e) {
        console.error("Failed to parse localStorage cache:", e);
        setCache(null);
      }
    } else {
      setCache(null);
    }
  }, [dynamicCacheKey]);

  // Persist cache to localStorage on change
  useEffect(() => {
    if (cache) {
      try {
        const cacheString = JSON.stringify(cache);
        localStorage.setItem(dynamicCacheKey, cacheString);
      } catch (error) {
        console.error("Failed to save cache to localStorage:", error);
        // If storage is full, try to clear old cache entries
        if ((error as { name: string }).name === "QuotaExceededError") {
          console.warn(
            "localStorage quota exceeded, clearing old cache entries"
          );
          try {
            // Clear other cache entries with same prefix
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(
              (key) => key.startsWith(cacheKeyPrefix) && key !== dynamicCacheKey
            );
            cacheKeys.forEach((key) => {
              try {
                localStorage.removeItem(key);
              } catch (removeError) {
                console.error("Failed to remove cache key:", key, removeError);
              }
            });
            // Try to save again
            localStorage.setItem(dynamicCacheKey, JSON.stringify(cache));
          } catch (retryError) {
            console.error("Failed to save cache after cleanup:", retryError);
          }
        }
      }
    }
  }, [cache, dynamicCacheKey]);

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
        let commitments: { commitments: Commitment[] };
        let liquidityPools: { group_pool_metric: LenderGroupsPoolMetrics[] };

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
    if (result.isFetched && result.data.length > 0) {
      setCache({
        data: result.data.filter((i) => i !== undefined),
        timestamp: Date.now(),
        whitelistedTokensFingerprint,
      });
    }
  }, [result.data, result.isFetched, whitelistedTokensFingerprint]);

  // Process and set commitments
  useEffect(() => {
    if (!whitelistedTokensFingerprint) {
      return;
    }

    if (result.isFetched) {
      setAllCommitments(result.data.filter((i) => i !== undefined));
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

    // Allow cache during transitions when whitelistedTokensFingerprint is empty
    if (!whitelistedTokensFingerprint && cache.whitelistedTokensFingerprint) {
      return isFresh ? cache.data : [];
    }

    return isFresh && (isSameFingerprint || isInitialLoad) ? cache.data : [];
  }, [cache, whitelistedTokensFingerprint]);

  return useMemo(() => {
    const isUsingCache = cachedCommitments.length > 0;
    const isInitialLoad = !!whitelistedTokensFingerprint;

    return {
      data: isUsingCache ? cachedCommitments : allCommitments,
      loading: isInitialLoad ? (isUsingCache ? false : result.loading) : true,
    };
  }, [
    allCommitments,
    cachedCommitments,
    result.loading,
    whitelistedTokensFingerprint,
  ]);
};
