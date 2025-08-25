import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useChainId } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { ALL_USDC_ADDRESSES } from "../../constants/tokens";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";

const getTokensForLoopSection = gql`
  query getAllLenderPools {
    group_pool_metric {
      id
      market_id
      max_loan_duration
      collateral_token_address
      principal_token_address
      total_principal_tokens_committed
      total_principal_tokens_borrowed
      total_principal_tokens_repaid
      total_principal_tokens_withdrawn
      total_interest_collected
      interest_rate_lower_bound
      current_min_interest_rate
      shares_token_address
      collateral_ratio
      group_pool_address
    }
  }
`;

export const useGetTokensForLoopSection = (enabled: boolean) => {
  const chainId = useChainId();
  const graphURL = getLiquidityPoolsGraphEndpoint(chainId);

  const { data: blockedPools } = useQuery<string[]>({
    queryKey: ["teller-widget", "blockedPools", chainId],
    queryFn: async () => {
      const response = await fetch(
        `https://xyon-xymz-1ofj.n7d.xano.io/api:x0wU2WHq/no_show_pools_by_network?network_id=${chainId}`
      );
      const data = await response.json();
      return data.map((pool: any) => pool.pool_id.toLowerCase());
    },
    enabled,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["teller-widget", "getTokensForLoopSection"],
    queryFn: async () => {
      const poolsData = await request<{
        group_pool_metric: LenderGroupsPoolMetrics[];
      }>(graphURL, getTokensForLoopSection);

      const filteredMetrics = poolsData.group_pool_metric.filter(
        (metric) => !blockedPools?.includes(metric.group_pool_address)
      );

      const poolsWithAddressPrefix = filteredMetrics.map((metric) => {
        return {
          ...metric,
          collateral_token_address: metric.collateral_token_address,
          group_pool_address: metric.group_pool_address,
          shares_token_address: metric.shares_token_address,
          principal_token_address: metric.principal_token_address,
        };
      });

      // Sort and organize pools
      const otherPools: LenderGroupsPoolMetrics[] = [];

      poolsWithAddressPrefix.forEach((metric: LenderGroupsPoolMetrics) => {
        if (
          !ALL_USDC_ADDRESSES.includes(
            metric.collateral_token_address.toLowerCase()
          )
        ) {
          otherPools.push(metric);
        }
      });

      // Combine and reduce into final format
      const pools = otherPools.reduce(
        (
          acc: { [key: string]: LenderGroupsPoolMetrics[] },
          pool: LenderGroupsPoolMetrics
        ) => {
          if (!acc[pool.collateral_token_address]) {
            acc[pool.collateral_token_address] = [];
          }
          acc[pool.collateral_token_address].push(pool);
          return acc;
        },
        {}
      );

      return Object.keys(pools);
    },
  });

  return { pools: data || [], isLoading };
};
