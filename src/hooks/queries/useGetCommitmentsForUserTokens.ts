import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { createFingerprintHash } from "../../helpers/localStorageCache";
import type { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import type { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";

interface Commitment {
  collateralToken: {
    address: string;
  };
}

type CachedCommitments = {
  data: UserToken[];
  timestamp: number;
  userTokensFingerprint: string;
  chainId: number;
};

type CommitmentsCache = {
  [chainId: string]: {
    [address: string]: CachedCommitments;
  };
};

const cacheKeyPrefix = "commitmentsForUserTokens";
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

export const useGetCommitmentsForUserTokens = () => {
  const chainId = useChainId();
  const graphURL = useGraphURL();
  const lenderGroupsGraphUrlV1 = getLiquidityPoolsGraphEndpoint(chainId);
  const lenderGroupsGraphUrlV2 = getLiquidityPoolsGraphEndpoint(chainId, true);
  const { userTokens, cacheKey, isLoading } = useGetGlobalPropsContext();
  const { address } = useAccount();

  const [tokensWithCommitments, setTokensWithCommitments] = useState<
    UserToken[]
  >([]);
  const [cache, setCache] = useState<CommitmentsCache>({});

  const userTokenCommitments = useMemo(
    () =>
      gql`
        query commitmentsForUserTokens${address} {
          commitments(
            where: {
              collateralToken_: {
                address_in: ${JSON.stringify(
                  Array.from(new Set(userTokens.map((token) => token.address)))
                )}
              }
              status: "Active"
              committedAmount_gt: "0"
            }
          ) {
            collateralToken {
              address
            }
          }
        }
      `,
    [userTokens, address]
  );

  const lenderGroupsUserTokenCommitments = useMemo(
    () =>
      gql`
        query checkCommitmentsLenderGroups${address} {
          group_pool_metric(
            where: {
              collateral_token_address: {
                _in: ${JSON.stringify(
                  Array.from(new Set(userTokens.map((token) => token.address)))
                )}
              }
            }
          ) {
            group_pool_address
            collateral_token_address
          }
        }
      `,
    [userTokens, address]
  );

  const userTokensFingerprint = useMemo(() => {
    let fingerprint = address
      ? `${chainId}:${userTokens
          .map((t) => `${t.address}:${t.balance}`)
          .join(",")}`
      : "";

    if (cacheKey) fingerprint = `${cacheKey}//${fingerprint}`;

    return fingerprint;
  }, [userTokens, address, cacheKey, chainId]);

  // Create static cache key based on address only (chain-agnostic)
  const dynamicCacheKey = useMemo(() => {
    if (!address) return `${cacheKeyPrefix}_empty`;
    const hash = createFingerprintHash(address);
    return `${cacheKeyPrefix}_${hash}`;
  }, [address]);

  const {
    data: userTokenCommitmentsData,
    isFetched: userTokenCommitmentsFetched,
    isLoading: userTokenCommitmentsLoading,
  } = useQuery({
    queryKey: [
      "teller-widget",
      "userTokenCommitments",
      chainId,
      address,
      userTokensFingerprint,
    ],
    queryFn: async () => request(graphURL, userTokenCommitments),
    enabled: userTokens.length > 0 && !!address && !!userTokensFingerprint,
  }) as {
    data: { commitments: Commitment[] };
    isLoading: boolean;
    isFetched: boolean;
  };

  const {
    data: lenderGroupsUserTokenCommitmentsData,
    isFetched: lenderGroupsUserTokenCommitmentsFetched,
    isLoading: lenderGroupsUserTokenCommitmentsLoading,
  } = useQuery({
    queryKey: [
      "teller-widget",
      "lenderGroupsUserTokenCommitments",
      chainId,
      address,
      userTokensFingerprint,
    ],
    queryFn: async () => {
      let metricsV1: LenderGroupsPoolMetrics[] = [];
      try {
        metricsV1 = (
          await request<{ group_pool_metric: LenderGroupsPoolMetrics[] }>(
            lenderGroupsGraphUrlV1,
            lenderGroupsUserTokenCommitments
          )
        ).group_pool_metric.map((metric) => ({ ...metric, isV2: false }));
      } catch (e) {
        console.warn(e);
      }

      let metricsV2: LenderGroupsPoolMetrics[] = [];
      try {
        metricsV2 = (
          await request<{ group_pool_metric: LenderGroupsPoolMetrics[] }>(
            lenderGroupsGraphUrlV2,
            lenderGroupsUserTokenCommitments
          )
        ).group_pool_metric.map((metric) => ({ ...metric, isV2: true }));
      } catch (e) {
        console.warn(e);
      }

      const metrics = [...metricsV1, ...metricsV2];

      return metrics.map((metric) => ({
        ...metric,
        collateralToken: {
          address: metric.collateral_token_address,
        },
      }));
    },
    enabled: userTokens.length > 0 && !!address && !!userTokensFingerprint,
  }) as {
    data: {
      group_pool_address: string;
      collateral_token_address: string;
      collateralToken: {
        address: string;
      };
    }[];
    isLoading: boolean;
    isFetched: boolean;
  };

  // Function to load cache from localStorage synchronously
  const loadCacheFromStorage = useCallback(() => {
    try {
      const lsItem = localStorage.getItem(dynamicCacheKey);
      if (lsItem) {
        try {
          const parsed = JSON.parse(lsItem) as CommitmentsCache;
          setCache(parsed);
          return parsed;
        } catch (parseError) {
          console.error("Failed to parse localStorage cache:", parseError);
          // Remove corrupted cache entry
          try {
            localStorage.removeItem(dynamicCacheKey);
          } catch (removeError) {
            console.error("Failed to remove corrupted cache:", removeError);
          }
          setCache({});
          return {};
        }
      } else {
        setCache({});
        return {};
      }
    } catch (storageError) {
      console.error("Failed to access localStorage:", storageError);
      setCache({});
      return {};
    }
  }, [dynamicCacheKey]);

  // Load cache from localStorage when dynamicCacheKey changes
  useEffect(() => {
    loadCacheFromStorage();
  }, [loadCacheFromStorage]);

  // Persist cache to localStorage on change
  useEffect(() => {
    if (Object.keys(cache).length > 0) {
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

  // Update in-memory cache when new commitments are available
  useEffect(() => {
    if (
      chainId &&
      address &&
      userTokenCommitmentsFetched &&
      lenderGroupsUserTokenCommitmentsFetched &&
      tokensWithCommitments.length > 0
    ) {
      setCache((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          [address]: {
            data: tokensWithCommitments,
            timestamp: Date.now(),
            userTokensFingerprint,
            chainId,
          },
        },
      }));
    }
  }, [
    tokensWithCommitments,
    address,
    chainId,
    userTokenCommitmentsFetched,
    lenderGroupsUserTokenCommitmentsFetched,
    userTokensFingerprint,
  ]);

  // Load cached data immediately when chain changes, before userTokens are loaded
  useEffect(() => {
    if (!address || !chainId) return;

    // Load cache synchronously from localStorage first
    const currentCache = loadCacheFromStorage();

    const entry = currentCache[chainId]?.[address];
    if (entry) {
      const isFresh = Date.now() - entry.timestamp < CACHE_TIME;
      if (isFresh) {
        setTokensWithCommitments(entry.data);
        return;
      }
    }

    // Only clear if no valid cache found
    setTokensWithCommitments([]);
  }, [chainId, address, loadCacheFromStorage]);

  // Combine and process commitments
  useEffect(() => {
    if (!address || !userTokens.length) {
      setTokensWithCommitments([]);
      return;
    }

    if (
      userTokenCommitmentsFetched &&
      lenderGroupsUserTokenCommitmentsFetched
    ) {
      const combined = [
        ...(userTokenCommitmentsData?.commitments || []),
        ...(lenderGroupsUserTokenCommitmentsData || []),
      ];

      const uniqueUserTokens = combined.reduce((acc, current) => {
        const existing = acc.find(
          (t) => t.address === current?.collateralToken?.address
        );
        if (!existing) {
          const matched = userTokens.find(
            (token) =>
              token?.address.toLowerCase() ===
              current?.collateralToken?.address.toLowerCase()
          );
          if (matched) acc.push(matched);
        }
        return acc;
      }, [] as UserToken[]);

      setTokensWithCommitments(uniqueUserTokens);
    }
  }, [
    userTokenCommitmentsData,
    lenderGroupsUserTokenCommitmentsData,
    userTokens,
    address,
    userTokenCommitmentsFetched,
    lenderGroupsUserTokenCommitmentsFetched,
    userTokensFingerprint, // Add fingerprint to force reprocessing when balances change
  ]);

  const cachedCommitments = useMemo(() => {
    if (!chainId || !address) return [];

    const entry = cache[chainId]?.[address];
    if (!entry) return [];

    // Validate that cached data is for the correct chain
    if (entry.chainId !== chainId) return [];

    const isFresh = Date.now() - entry.timestamp < CACHE_TIME;

    // If cache is not fresh, return empty
    if (!isFresh) return [];

    // Always return cached data if fresh, regardless of userTokens state
    // This prioritizes cached data during chain transitions
    return entry.data;
  }, [cache, address, chainId]);

  return useMemo(() => {
    const isUsingCache = cachedCommitments.length > 0;
    const hasCurrentData = tokensWithCommitments.length > 0;
    const isInitialLoad = !!userTokensFingerprint;

    return {
      tokensWithCommitments: isUsingCache
        ? cachedCommitments
        : tokensWithCommitments,
      loading: isInitialLoad
        ? isUsingCache || hasCurrentData
          ? false
          : userTokenCommitmentsLoading ||
            lenderGroupsUserTokenCommitmentsLoading ||
            isLoading
        : true,
    };
  }, [
    tokensWithCommitments,
    cachedCommitments,
    userTokenCommitmentsLoading,
    lenderGroupsUserTokenCommitmentsLoading,
    userTokensFingerprint,
    isLoading,
  ]);
};
