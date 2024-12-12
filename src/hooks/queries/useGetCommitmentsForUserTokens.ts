import { UseQueryResult, useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";

import { UserToken } from "../useGetUserTokens";
import { useGraphURL } from "../useGraphURL";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useChainId } from "wagmi";

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

  const { data, refetch } = useQuery({
    queryKey: [`commitmentsForUserTokens-${chainId}`],
    queryFn: async () => request(graphURL, userTokenCommitments),
    enabled: !!hasTokens,
  }) as {
    data: { commitments: Commitment[] };
    isLoading: boolean;
    refetch: any;
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await refetch();
    })();
  }, [chainId, refetch, userTokens]);

  useEffect(() => {
    if (!userTokens.length) setLoading(true);
    if (data?.commitments) {
      const userCommitments = data.commitments.reduce((acc, current) => {
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
      const userCommitmentsUnique = userCommitments.filter((item, index, self) => {
        return (
          item.address &&
          self.findIndex((obj) => obj.address === item.address) === index
        );
      });
      setTokensWithCommitments(userCommitmentsUnique);
      setLoading(false);
    }
  }, [data, userTokens, setTokensWithCommitments, setLoading]);

  return useMemo(
    () => ({ tokensWithCommitments, loading }),
    [tokensWithCommitments, loading]
  );
};
