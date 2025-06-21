import { useQuery } from "@tanstack/react-query";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

export const useGetLiquidityPools = () => {
  const chainId = useChainId();
  const graphURL = getLiquidityPoolsGraphEndpoint(chainId);
  const { singleWhitelistedToken, principalTokenForPair } =
    useGetGlobalPropsContext();

  const poolCommitmentsDashboard = useMemo(
    () => gql`
    query groupLiquidityPools {
      group_pool_metric(
        where: {
          ${
            singleWhitelistedToken
              ? `collateral_token_address: {_eq: "${singleWhitelistedToken.toLowerCase()}"},`
              : ""
          }
          ${
            principalTokenForPair
              ? `principal_token_address: {_eq: "${principalTokenForPair.toLowerCase()}"},`
              : ""
          }
        }
      ) {
        id
        market_id
        max_loan_duration
        collateral_token_address
        principal_token_address
        total_principal_tokens_committed
        total_principal_tokens_borrowed
        total_principal_tokens_withdrawn
        total_interest_collected
        interest_rate_lower_bound
        interest_rate_upper_bound
        current_min_interest_rate
        shares_token_address
        collateral_ratio
        group_pool_address
        smart_commitment_forwarder_address
      }
    }
  `,
    [principalTokenForPair, singleWhitelistedToken]
  );

  const { data: blockedPools } = useQuery({
    queryKey: ["teller-widget", "blockedPools", chainId],
    queryFn: async () => {
      const response = await fetch(
        `https://xyon-xymz-1ofj.n7d.xano.io/api:x0wU2WHq/no_show_pools_by_network?network_id=${chainId}`
      );
      const data = await response.json();
      return data.map((pool: any) => pool.pool_id.toLowerCase());
    },
  });

  const { data, isLoading, error, isFetched } = useQuery({
    queryKey: ["teller-widget", "allLiquidityPools", chainId, blockedPools],
    queryFn: async () => {
      const response = await request<{
        group_pool_metric: LenderGroupsPoolMetrics[];
      }>(graphURL, poolCommitmentsDashboard);

      let filteredPools = blockedPools?.length
        ? response.group_pool_metric.filter(
            (pool) =>
              !blockedPools.includes(pool.group_pool_address.toLowerCase())
          )
        : response.group_pool_metric;

      // Filter out pools with 0 or negative liquidity
      const hiddenPools: LenderGroupsPoolMetrics[] = [];
      filteredPools = filteredPools.filter((pool) => {
        const committed = BigInt(pool.total_principal_tokens_committed);
        const withdrawn = BigInt(pool.total_principal_tokens_withdrawn);
        const interest = BigInt(pool.total_interest_collected);
        const trueLiquidity = committed - (withdrawn + interest);
        if (trueLiquidity <= 0n) {
          hiddenPools.push(pool);
        }
        return trueLiquidity > 0n;
      });
      return filteredPools;
    },
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { liquidityPools: data || [], isLoading, isFetched };
};
