import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { useChainId, useAccount } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";

const cacheKeyPrefix = "commitmentsForUserTokens";
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

interface Commitment {
  collateralToken: {
    address: string;
  };
}

type CachedCommitments = {
  data: UserToken[];
  timestamp: number;
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
  const { userTokens } = useGetGlobalPropsContext();
  const { address } = useAccount();

  const hasTokens = userTokens.length > 0;

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

  const { data, isFetched } = useQuery({
    queryKey: ["teller-widget", `${cacheKeyPrefix}-${chainId}-${address}`],
    queryFn: async () => request(graphURL, userTokenCommitments),
    enabled: !!hasTokens,
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
      `lenderGroupsUserTokenCommitments-${chainId}-${address}`,
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
    enabled: !!hasTokens,
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
    const lsItem = localStorage.getItem(cacheKeyPrefix);
    if (lsItem) {
      try {
        const parsed: CommitmentsCache = JSON.parse(lsItem);
        setCache(parsed);
      } catch (e) {
        console.error("Failed to parse localStorage cache:", e);
      }
    }
  }, []);

  // Persist cache to localStorage on change
  useEffect(() => {
    localStorage.setItem(cacheKeyPrefix, JSON.stringify(cache));
  }, [cache]);

  // Update in-memory cache when new commitments are available
  useEffect(() => {
    if (
      chainId &&
      address &&
      !loading &&
      isFetched &&
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
          },
        },
      }));
    }
  }, [
    tokensWithCommitments,
    address,
    chainId,
    loading,
    isFetched,
    lenderGroupsUserTokenCommitmentsFetched,
  ]);

  // Combine and process commitments
  useEffect(() => {
    if (!address || !userTokens.length) {
      setLoading(false);
      return;
    }

    if (isFetched && lenderGroupsUserTokenCommitmentsFetched) {
      const combined = [
        ...(data?.commitments || []),
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
    data,
    lenderGroupsUserTokenCommitmentsData,
    userTokens,
    address,
    isFetched,
    lenderGroupsUserTokenCommitmentsFetched,
  ]);

  const cachedCommitments = useMemo(() => {
    if (!chainId || !address) return [];

    const entry = cache[chainId]?.[address];
    if (!entry) return [];

    const isFresh = Date.now() - entry.timestamp < CACHE_TIME;
    return isFresh ? entry.data : [];
  }, [cache, address, chainId]);

  return useMemo(() => {
    const isUsingCache = cachedCommitments.length > 0;

    return {
      tokensWithCommitments: isUsingCache
        ? cachedCommitments
        : tokensWithCommitments,
      loading: isUsingCache
        ? false
        : loading || !isFetched || !lenderGroupsUserTokenCommitmentsFetched,
    };
  }, [
    tokensWithCommitments,
    cachedCommitments,
    loading,
    isFetched,
    lenderGroupsUserTokenCommitmentsFetched,
  ]);
};
