import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useChainId } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { ALL_USDC_ADDRESSES } from "../../constants/tokens";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useForwarderAddresses } from "../useForwarderAddresses";

const getTokensForLoopSectionPools = gql`
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
      collateral_ratio
      group_pool_address
    }
  }
`;

const getTokensForLoopSectionCommitments = (lcfAlphaAddress: string) => gql`
  {
    commitments(where: {  status: "Active", committedAmount_gt: "0" ,forwarderAddress_in: ${JSON.stringify(
      [lcfAlphaAddress]
    )}}) {
      collateralTokenAddress
    }
  }
`;

export const useGetTokensForLoopSection = (enabled: boolean) => {
  const chainId = useChainId();
  const graphUrlV1 = getLiquidityPoolsGraphEndpoint(chainId);
  const graphUrlV2 = getLiquidityPoolsGraphEndpoint(chainId, true);
  const { lcfAlphaAddress } = useForwarderAddresses();

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
      let tokensV1: string[] = [];
      try {
        tokensV1 = (
          await request<{
            group_pool_metric: LenderGroupsPoolMetrics[];
          }>(graphUrlV1, getTokensForLoopSectionPools)
        ).group_pool_metric
          .filter(
            (metric) => !blockedPools?.includes(metric.group_pool_address)
          )
          .map((metric) => metric.collateral_token_address);
      } catch (e) {
        console.warn(e);
      }

      let tokensV2: string[] = [];
      try {
        tokensV2 = (
          await request<{ group_pool_metric: LenderGroupsPoolMetrics[] }>(
            graphUrlV2,
            getTokensForLoopSectionPools
          )
        ).group_pool_metric
          .filter(
            (metric) => !blockedPools?.includes(metric.group_pool_address)
          )
          .map((metric) => metric.collateral_token_address);
      } catch (e) {
        console.warn(e);
      }

      let tokensOg: string[] = [];
      try {
        tokensOg = (
          await request<{ commitments: { collateralTokenAddress: string }[] }>(
            graphUrlV2,
            getTokensForLoopSectionCommitments(lcfAlphaAddress)
          )
        ).commitments.map((commitment) => commitment.collateralTokenAddress);
      } catch (e) {
        console.warn(e);
      }

      const tokens = [...tokensV1, ...tokensV2, ...tokensOg].filter(
        (token) => !ALL_USDC_ADDRESSES.includes(token.toLowerCase())
      );

      return tokens;
    },
    enabled,
  });

  const tokens = data || [];

  return { tokens, isLoading };
};
