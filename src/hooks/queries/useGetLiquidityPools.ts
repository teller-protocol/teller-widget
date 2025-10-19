import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";

import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useGetGraphEndpoint } from "../useGetGraphEndpoint";

export const useGetLiquidityPools = () => {
  const chainId = useChainId();
  const { endpoint: endpointV1, isFetched: isFetchedV1 } = useGetGraphEndpoint(
    chainId,
    "v1"
  );
  const { endpoint: endpointV2, isFetched: isFetchedV2 } = useGetGraphEndpoint(
    chainId,
    "v2"
  );
  const { singleWhitelistedToken, principalTokenForPair } =
    useGetGlobalPropsContext();

  const poolCommitmentsDashboard = useMemo(
    () => gql`
    query groupLiquidityPools {
      groupPoolMetrics(
        where: {
          ${
            singleWhitelistedToken
              ? `collateral_token_address: "${singleWhitelistedToken.toLowerCase()}"`
              : ""
          }
          ${
            principalTokenForPair
              ? `principal_token_address: "${principalTokenForPair.toLowerCase()}"`
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
      let metricsV1: LenderGroupsPoolMetrics[] = [];
      try {
        if (endpointV1) {
          metricsV1 = (
            await request<{
              groupPoolMetrics: LenderGroupsPoolMetrics[];
            }>(endpointV1, poolCommitmentsDashboard)
          ).groupPoolMetrics.map((metric) => ({ ...metric, isV2: false }));
        }
      } catch (e) {
        console.warn(e);
      }

      let metricsV2: LenderGroupsPoolMetrics[] = [];
      try {
        if (endpointV2) {
          metricsV2 = (
            await request<{
              groupPoolMetrics: LenderGroupsPoolMetrics[];
            }>(endpointV2, poolCommitmentsDashboard)
          ).groupPoolMetrics.map((metric) => ({ ...metric, isV2: true }));
        }
      } catch (e) {
        console.warn(e);
      }

      const metrics = [...metricsV1, ...metricsV2];

      let filteredPools = blockedPools?.length
        ? metrics.filter(
            (pool) =>
              !blockedPools.includes(pool.group_pool_address.toLowerCase())
          )
        : metrics;

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
    enabled: isFetchedV1 && isFetchedV2,
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { liquidityPools: data || [], isLoading, isFetched };
};
