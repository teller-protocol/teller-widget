import { UseQueryResult, useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";

import { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useChainId, useAccount } from "wagmi";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";

const cacheKey = "userTokensCommitments";

interface Commitment {
  collateralToken: {
    address: string;
  };
}

export const useGetCommitmentsForUserTokens = () => {
  const [tokensWithCommitments, setTokensWithCommitments] = useState<any[]>([]);
  const chainId = useChainId();
  const [loading, setLoading] = useState(true);
  const graphURL = useGraphURL();
  const lenderGroupsGraphURL = getLiquidityPoolsGraphEndpoint(chainId);
  const { userTokens } = useGetGlobalPropsContext();
  const { address } = useAccount();

  const hasTokens = userTokens.length > 0;

  let cachedResult;

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(cacheKey);
    const cacheTimestamp = cached ? JSON.parse(cached).timestamp : null;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    if (
      cached &&
      cacheTimestamp &&
      Date.now() - parseInt(cacheTimestamp, 10) < oneHour
    ) {
      cachedResult = { data: JSON.parse(cached).data, loading: false };
    }
  }

  const userTokenCommitments = useMemo(
    () =>
      gql`
        query commitmentsForUserTokens {
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
    [userTokens]
  );

  const lenderGroupsUserTokenCommitments = useMemo(
    () =>
      gql`
        query checkCommitmentsLenderGroups {
          groupPoolMetrics(
            where: {
              collateral_token_address_in: ${JSON.stringify(
                Array.from(new Set(userTokens.map((token) => token.address)))
              )}
            }
          ) {
            group_pool_address
            collateral_token_address
          }
        }
      `,
    [userTokens]
  );
  const { data, refetch, isFetched } = useQuery({
    queryKey: [`commitmentsForUserTokens-${chainId}`],
    queryFn: async () => request(graphURL, userTokenCommitments),
    enabled: !!hasTokens || !cachedResult?.data.length,
  }) as {
    data: { commitments: Commitment[] };
    isLoading: boolean;
    refetch: any;
    isFetched: boolean;
  };

  const {
    data: lenderGroupsUserTokenCommitmentsData,
    isLoading: lenderGroupsUserTokenCommitmentsLoading,
    isFetched: lenderGroupsUserTokenCommitmentsFetched,
  } = useQuery({
    queryKey: [`lenderGroupsUserTokenCommitments-${chainId}`],
    queryFn: async () => {
      const response = await request(
        lenderGroupsGraphURL,
        lenderGroupsUserTokenCommitments
      ).then((res: any) => {
        return res.groupPoolMetrics.map((metric: any) => ({
          ...metric,
          collateralToken: {
            address: metric.collateral_token_address,
          },
        }));
      });
      return response;
    },
    enabled: !!hasTokens || !cachedResult?.data.length,
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
    void (async () => {
      setLoading(true);
      await refetch();
    })();
  }, [chainId, refetch, userTokens]);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    if (!userTokens.length) {
      setLoading(true);
      return;
    }
    if (data?.commitments || lenderGroupsUserTokenCommitmentsData) {
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
      console.log(userCommitmentsUnique, "userCommitmentsUnique");

      if (
        typeof window !== "undefined" &&
        isFetched &&
        lenderGroupsUserTokenCommitmentsFetched
      ) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: userCommitmentsUnique, timestamp: Date.now() })
        );
      }
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
  ]);

  return useMemo(
    () => ({ tokensWithCommitments, loading }),
    [tokensWithCommitments, loading]
  );
};
