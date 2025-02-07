import { useQuery } from "@tanstack/react-query";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";

export const useGetLiquidityPools = () => {
  const chainId = useChainId();
  const graphURL = getLiquidityPoolsGraphEndpoint(chainId);

  const poolCommitmentsDashboard = useMemo(
    () => gql`
      query groupLiquidityPools {
        groupPoolMetrics(
          orderBy: current_min_interest_rate
          orderDirection: asc
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
    []
  );

const { data, isLoading, error } = useQuery({
    queryKey: ["allLiquidityPools"],
    queryFn: async () => {
      const response = await request(graphURL, poolCommitmentsDashboard);
      return response.groupPoolMetrics as LenderGroupsPoolMetrics[];
    },
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { liquidityPools: data || [], isLoading };
};
