import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";

import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useGetGraphEndpoint } from "../useGetGraphEndpoint";

export const useGetRolloverableCommitmentsFromLiquidityPools = (
  collateralTokenAddress?: string,
  principalTokenAddress?: string
) => {
  const chainId = useChainId();
  const { endpoint: endpointV1, isFetched: isFetchedV1 } = useGetGraphEndpoint(
    chainId,
    "v1"
  );

  const { endpoint: endpointV2, isFetched: isFetchedV2 } = useGetGraphEndpoint(
    chainId,
    "v2"
  );

  const collateralTokenCommitments = useMemo(
    () => gql`
      query rolloverableCommitmentsForCollateralTokenFromLiquidityPools_${collateralTokenAddress} {
        groupPoolMetrics(
          where: {
            collateral_token_address: "${collateralTokenAddress}"
            principal_token_address: "${principalTokenAddress}"
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
        if (endpointV1) {
          metricsV1 = (
            await request<{
              groupPoolMetrics: LenderGroupsPoolMetrics[];
            }>(endpointV1, collateralTokenCommitments)
          ).groupPoolMetrics.map((metric) => ({ ...metric, isV2: false }));
        }
      } catch (e) {
        console.warn(e);
      }

      let metricsV2: LenderGroupsPoolMetrics[] = [];
      try {
        if (endpointV2) {
          metricsV2 = (
            await request<{ groupPoolMetrics: LenderGroupsPoolMetrics[] }>(
              endpointV2,
              collateralTokenCommitments
            )
          ).groupPoolMetrics.map((metric) => ({ ...metric, isV2: true }));
        }
      } catch (e) {
        console.warn(e);
      }

      const metrics = [...metricsV2, ...metricsV1];

      return { groupPoolMetrics: metrics };
    },
    enabled: !!collateralTokenAddress && isFetchedV1 && isFetchedV2,
  }) as {
    data: { groupPoolMetrics: LenderGroupsPoolMetrics[] };
    isLoading: boolean;
  };

  return { data, isLoading };
};
