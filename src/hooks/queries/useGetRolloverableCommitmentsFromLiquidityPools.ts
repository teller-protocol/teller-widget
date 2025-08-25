import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";

import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";

export const useGetRolloverableCommitmentsFromLiquidityPools = (
  collateralTokenAddress?: string,
  principalTokenAddress?: string
) => {
  const chainId = useChainId();
  const graphUrlV1 = getLiquidityPoolsGraphEndpoint(chainId);
  const graphUrlV2 = getLiquidityPoolsGraphEndpoint(chainId, true);

  const collateralTokenCommitments = useMemo(
    () => gql`
      query rolloverableCommitmentsForCollateralTokenFromLiquidityPools_${collateralTokenAddress} {
        group_pool_metric(
          where: {
            collateral_token_address: {_eq: "${collateralTokenAddress}"},
            principal_token_address: {_eq: "${principalTokenAddress}"}
          }
          order_by: {collateral_ratio: desc}
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
    [collateralTokenAddress, principalTokenAddress]
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      "teller-widget",
      "rolloverableCommitmentsForCollateralTokenFromLiquidityPools-",
      collateralTokenAddress,
    ],
    queryFn: async () => {
      let metricsV1: LenderGroupsPoolMetrics[] = [];
      try {
        metricsV1 = (
          await request<{
            group_pool_metric: LenderGroupsPoolMetrics[];
          }>(graphUrlV1, collateralTokenCommitments)
        ).group_pool_metric.map((metric) => ({ ...metric, isV2: false }));
      } catch (e) {
        console.warn(e);
      }

      let metricsV2: LenderGroupsPoolMetrics[] = [];
      try {
        metricsV2 = (
          await request<{ group_pool_metric: LenderGroupsPoolMetrics[] }>(
            graphUrlV2,
            collateralTokenCommitments
          )
        ).group_pool_metric.map((metric) => ({ ...metric, isV2: true }));
      } catch (e) {
        console.warn(e);
      }

      const metrics = [...metricsV1, ...metricsV2];

      return { group_pool_metric: metrics };
    },
    enabled: !!collateralTokenAddress,
  }) as {
    data: { group_pool_metric: LenderGroupsPoolMetrics[] };
    isLoading: boolean;
  };

  return { data, isLoading };
};
