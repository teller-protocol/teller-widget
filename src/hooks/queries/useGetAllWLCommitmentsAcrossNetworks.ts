import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { getGraphEndpointWithKey } from "../../constants/graphEndpoints";
import request, { gql } from "graphql-request";
import { UserToken } from "../useGetUserTokens";
import { useQueries } from "@tanstack/react-query";
import { base, mainnet } from "viem/chains";
import { polygon } from "viem/chains";
import { arbitrum } from "viem/chains";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetTokensData } from "../useFetchTokensData";

const cacheKey = "commitments_across_networks";

const commitmentsQuery = (tokens: string[]) => gql`
  query commitmentsForUserTokens {
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
        query checkCommitmentsLenderGroups {
          groupPoolMetrics(
            where: {
              collateral_token_address_in: ${JSON.stringify(
                Array.from(new Set(tokens))
              )}
            }
          ) {
            group_pool_address
            collateral_token_address
          }
        }
      `;

export const useGetAllWLCommitmentsAcrossNetworks = () => {
  const { subgraphApiKey, userTokens, whitelistedTokens } =
    useGetGlobalPropsContext();

  const { fetchAllWhitelistedTokensData } = useGetTokensData();

  const mainnetID = mainnet.id;
  const polygonID = polygon.id;
  const arbitrumID = arbitrum.id;
  const baseID = base.id;

  const subpgraphIds = [mainnetID, polygonID, arbitrumID, baseID];

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

  const result = useQueries({
    queries: subpgraphIds.map((id, index) => ({
      queryKey: ["commitments", id, index],
      queryFn: async () => {
        const tokens = whitelistedTokens?.[id] || [];

        let commitments: any;
        let liquidityPools: any;

        try {
          commitments = await request(
            getGraphEndpointWithKey(subgraphApiKey, id) ?? "",
            commitmentsQuery(tokens)
          );
          liquidityPools = await request(
            getLiquidityPoolsGraphEndpoint(id) ?? "",
            liquidityPoolsQuery(tokens)
          );
        } catch (error) {
          console.error(
            "Error fetching commitments or liquidity pools:",
            error
          );
          return [];
        }

        const commitmentsWithCollateralAddressOnly =
          commitments.commitments.map(
            (commitment: { collateralToken: { address: string } }) =>
              commitment?.collateralToken?.address
          );

        const liquidityPoolsWithCollateralAddressOnly =
          liquidityPools.groupPoolMetrics.map(
            (pool: { collateral_token_address: string }) =>
              pool.collateral_token_address
          );

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
    })),
    combine: (results) => {
      const allData = results.map((d) => d.data).flat();
      const allDataFetched = results.every((d) => d.isSuccess);
      if (typeof window !== "undefined" && allDataFetched) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: allData, timestamp: Date.now() })
        );
      }
      return { data: allData, loading: results.some((d) => d.isLoading) };
    },
  });

  return cachedResult ?? result;
};
