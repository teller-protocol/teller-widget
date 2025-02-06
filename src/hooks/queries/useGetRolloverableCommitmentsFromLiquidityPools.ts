import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useGraphURL } from "../useGraphURL";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import { useChainId } from "wagmi";

export const useGetRolloverableCommitmentsFromLiquidityPools = (
  collateralTokenAddress?: string,
  principalTokenAddress?: string
) => {
  const chainId = useChainId();
  const graphURL = getLiquidityPoolsGraphEndpoint(chainId);

  const collateralTokenCommitments = useMemo(
    () => gql`
      query rolloverableCommitmentsForCollateralTokenFromLiquidityPools_${collateralTokenAddress} {
        groupPoolMetrics(
          where: {
            collateral_token_address: "${collateralTokenAddress}",
            principal_token_address: "${principalTokenAddress}"
          }
          orderBy: collateral_ratio
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
    [collateralTokenAddress, principalTokenAddress]
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      "rolloverableCommitmentsForCollateralTokenFromLiquidityPools-",
      collateralTokenAddress,
    ],
    queryFn: async () => request(graphURL, collateralTokenCommitments),
    enabled: !!collateralTokenAddress,
  }) as {
    data: { groupPoolMetrics: LenderGroupsPoolMetrics[] };
    isLoading: boolean;
  };

  return { data, isLoading };
};
