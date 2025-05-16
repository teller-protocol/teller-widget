import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { getGraphEndpointWithKey } from "../../constants/graphEndpoints";
import request, { gql } from "graphql-request";
import { UserToken } from "../useGetUserTokens";
import { useQueries } from "@tanstack/react-query";
import { base, mainnet } from "viem/chains";
import { polygon } from "viem/chains";
import { arbitrum } from "viem/chains";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useGetAllWhitelistedTokensData } from "../useFetchTokensData";

const commitmentsQuery = (tokens: UserToken[]) => gql`
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

const liquidityPoolsQuery = (tokens: UserToken[]) => gql`
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

  const { fetchAllWhitelistedTokensData } = useGetAllWhitelistedTokensData();

  const mainnetID = mainnet.id;
  const polygonID = polygon.id;
  const arbitrumID = arbitrum.id;
  const baseID = base.id;

  const subpgraphIds = [mainnetID, polygonID, arbitrumID, baseID];

  const result = useQueries({
    queries: subpgraphIds.map((id, index) => ({
      queryKey: ["commitments", id, index],
      queryFn: async () => {
        const tokens = whitelistedTokens?.[id];

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
      return { data: allData, loading: results.some((d) => d.isLoading) };
    },
  });

  return result;
};
