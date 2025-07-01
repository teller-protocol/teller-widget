import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { useChainId, useAccount } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";

const cacheKeyPrefix = "commitmentsForUserTokens";

interface Commitment {
  collateralToken: {
    address: string;
  };
}

export const useGetCommitmentsForUserTokens = () => {
  const chainId = useChainId();
  const [loading, setLoading] = useState(true);
  const graphURL = useGraphURL();
  const lenderGroupsGraphURL = getLiquidityPoolsGraphEndpoint(chainId);
  const { userTokens } = useGetGlobalPropsContext();
  const { address } = useAccount();

  const hasTokens = userTokens.length > 0;

  const [tokensWithCommitments, setTokensWithCommitments] = useState<any[]>([]);

  const userTokenCommitments = useMemo(
    () =>
      gql`
        query commitmentsForUserTokens${address} {
          commitments(
            where: {
              collateralToken_: { address_in: ${JSON.stringify(
                Array.from(new Set(userTokens.map((token) => token.address)))
              )} }
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
              collateral_token_address: {_in: ${JSON.stringify(
                Array.from(new Set(userTokens.map((token) => token.address)))
              )}}
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
    // staleTime: 15 * 60 * 1000, // 15 minutes
    // refetchInterval: 15 * 60 * 1000, // every 15 minutes
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
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
      const response = await request(
        lenderGroupsGraphURL,
        lenderGroupsUserTokenCommitments
      ).then((res: any) => {
        return res.group_pool_metric.map((metric: any) => ({
          ...metric,
          collateralToken: {
            address: metric.collateral_token_address,
          },
        }));
      });
      return response;
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

  useEffect(() => {
    if (tokensWithCommitments.length) {
      setLoading(false);
      return;
    }
    if (!address) {
      setLoading(false);
      return;
    }
    if (!userTokens.length) {
      setLoading(true);
      return;
    }
    if (isFetched && lenderGroupsUserTokenCommitmentsFetched) {
      const combinedCommitments = [
        ...(data?.commitments || []),
        ...(lenderGroupsUserTokenCommitmentsData || []),
      ];
      const userCommitments = combinedCommitments.reduce((acc, current) => {
        if (
          acc?.find(
            (commitment) =>
              commitment?.address === current?.collateralToken?.address
          )
        ) {
          return acc;
        } else {
          const userTokenFromCommitment = userTokens.find(
            (token) =>
              token?.address.toLowerCase() ===
              current?.collateralToken?.address.toLowerCase()
          );
          if (userTokenFromCommitment) {
            acc.push(userTokenFromCommitment);
          }
        }
        return acc;
      }, [] as UserToken[]);
      const userCommitmentsUnique = userCommitments.filter(
        (item, index, self) => {
          return (
            item.address &&
            self.findIndex((obj) => obj.address === item.address) === index
          );
        }
      );
      setTokensWithCommitments(userCommitmentsUnique);

      setLoading(false);
    }
  }, [
    data,
    userTokens,
    setTokensWithCommitments,
    setLoading,
    lenderGroupsUserTokenCommitmentsData,
    address,
    isFetched,
    lenderGroupsUserTokenCommitmentsFetched,
    tokensWithCommitments.length,
  ]);

  // cache
  const [cache, setCache] = useState<{
    [chainId: string]: { [address: string]: any[] };
  }>({});

  // load cache from local storage
  useEffect(() => {
    const lsItem = localStorage.getItem(cacheKeyPrefix);
    if (lsItem) {
      try {
        const lsItemParsed = JSON.parse(lsItem);
        if (lsItemParsed) {
          setCache(lsItemParsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // write cache to local storage
  useEffect(() => {
    localStorage.setItem(cacheKeyPrefix, JSON.stringify(cache));
  }, [cache]);

  // update cache on new data received
  useEffect(() => {
    if (chainId && address && tokensWithCommitments.length && !loading) {
      setCache((cache) => ({
        ...cache,
        [chainId]: { ...cache[chainId], [address]: tokensWithCommitments },
      }));
    }
  }, [tokensWithCommitments, address, chainId, loading]);

  const cachedCommitments = useMemo(
    () =>
      chainId && address && cache[chainId] ? cache[chainId][address] || [] : [],
    [cache, address, chainId]
  );

  return useMemo(
    () => ({
      tokensWithCommitments: cachedCommitments.length
        ? cachedCommitments
        : tokensWithCommitments,
      loading: cachedCommitments.length ? false : loading,
    }),
    [tokensWithCommitments, cachedCommitments, loading]
  );
};
