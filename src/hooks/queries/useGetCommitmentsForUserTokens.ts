import { UseQueryResult, useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";

import { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useChainId } from "wagmi";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";

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

  const hasTokens = userTokens.length > 0;

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
  const { data, refetch } = useQuery({
    queryKey: [`commitmentsForUserTokens-${chainId}`],
    queryFn: async () => request(graphURL, userTokenCommitments),
    enabled: !!hasTokens,
  }) as {
    data: { commitments: Commitment[] };
    isLoading: boolean;
    refetch: any;
  };

  const {
    data: lenderGroupsUserTokenCommitmentsData,
    isLoading: lenderGroupsUserTokenCommitmentsLoading,
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
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await refetch();
    })();
  }, [chainId, refetch, userTokens]);

  useEffect(() => {
    if (!userTokens.length) {
      setLoading(false);
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
      setLoading(false);
    }
  }, [
    data,
    userTokens,
    setTokensWithCommitments,
    setLoading,
    lenderGroupsUserTokenCommitmentsData,
  ]);

  return useMemo(
    () => ({ tokensWithCommitments, loading }),
    [tokensWithCommitments, loading]
  );
};
