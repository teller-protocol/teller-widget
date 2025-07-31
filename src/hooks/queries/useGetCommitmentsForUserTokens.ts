import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import type { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";

const cacheKeyPrefix = (cacheKey?: string) =>
  cacheKey
    ? `commitmentsForUserTokens-${cacheKey}`
    : "commitmentsForUserTokens";
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

interface Commitment {
  collateralToken: {
    address: string;
  };
}

type CachedCommitments = {
  data: UserToken[];
  timestamp: number;
  userTokensFingerprint: string;
};

type CommitmentsCache = {
  [chainId: string]: {
    [address: string]: CachedCommitments;
  };
};

export const useGetCommitmentsForUserTokens = () => {
  const chainId = useChainId();
  const graphURL = useGraphURL();
  const lenderGroupsGraphURL = getLiquidityPoolsGraphEndpoint(chainId);
  const { userTokens, cacheKey } = useGetGlobalPropsContext();
  const { address } = useAccount();

  const [tokensWithCommitments, setTokensWithCommitments] = useState<
    UserToken[]
  >([]);
  const [loading, setLoading] = useState(true);
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

  const userTokensFingerprint = useMemo(
    () =>
      address
        ? userTokens.map((t) => `${t.address}:${t.balance}`).join(",")
        : "",
    [userTokens, address]
  );

  const {
    data: userTokenCommitmentsData,
    isFetched: userTokenCommitmentsFetched,
  } = useQuery({
    queryKey: [
      "teller-widget",
      "userTokenCommitments",
      chainId,
      address,
      userTokensFingerprint,
    ],
    queryFn: async () => request(graphURL, userTokenCommitments),
    enabled: !!userTokensFingerprint,
  }) as {
    data: { commitments: Commitment[] };
    isLoading: boolean;
    refetch: any;
    isFetched: boolean;
  };


  const {
    data: lenderGroupsUserTokenCommitmentsData,
    isFetched: lenderGroupsUserTokenCommitmentsFetched,
  } = useQuery({
    queryKey: [
      "teller-widget",
      "lenderGroupsUserTokenCommitments",
      chainId,
      address,
      userTokensFingerprint,
    ],
    queryFn: async () => {
      const res: any = await request(
        lenderGroupsGraphURL,
        lenderGroupsUserTokenCommitments
      );
      return res.group_pool_metric.map((metric: any) => ({
        ...metric,
        collateralToken: {
          address: metric.collateral_token_address,
        },
      }));
    },
    enabled: !!userTokensFingerprint,
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

  // Update in-memory cache when new commitments are available
  useEffect(() => {
    if (
      chainId &&
      address &&
      !loading &&
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
          },
        },
      }));
    }
  }, [
    tokensWithCommitments,
    address,
    chainId,
    loading,
    userTokenCommitmentsFetched,
    lenderGroupsUserTokenCommitmentsFetched,
    userTokensFingerprint,
  ]);

  // Combine and process commitments
  useEffect(() => {
    if (!address || !userTokens.length) {
      setLoading(false);
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
      setLoading(false);
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

    const isFresh = Date.now() - entry.timestamp < CACHE_TIME;
    const isSameFingerprint =
      entry.userTokensFingerprint === userTokensFingerprint;

    // On initial load when userTokens is empty, use cached data if it's fresh
    const isInitialLoad = userTokens.length === 0;

    // If userTokens have loaded and fingerprint changed, don't use cache
    if (userTokens.length > 0 && !isSameFingerprint) return [];

    return isFresh && (isSameFingerprint || isInitialLoad) ? entry.data : [];
  }, [cache, address, chainId, userTokensFingerprint, userTokens.length]);

  return useMemo(() => {
    const isUsingCache = cachedCommitments.length > 0;
    const isInitialLoad = !!userTokensFingerprint;

    return {
      tokensWithCommitments: isUsingCache
        ? cachedCommitments
        : tokensWithCommitments,
      loading: isUsingCache
        ? false
        : (isInitialLoad ? false : loading) ||
          !userTokenCommitmentsFetched ||
          !lenderGroupsUserTokenCommitmentsFetched,
    };
  }, [
    tokensWithCommitments,
    cachedCommitments,
    loading,
    userTokenCommitmentsFetched,
    lenderGroupsUserTokenCommitmentsFetched,
    userTokensFingerprint,
  ]);
};
