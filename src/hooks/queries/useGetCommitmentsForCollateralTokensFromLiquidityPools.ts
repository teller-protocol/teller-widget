import { useQuery } from "@tanstack/react-query";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import { useChainId } from "wagmi";
import { useConvertLenderGroupCommitmentToCommitment } from "../useConvertLenderGroupCommitmentToCommitment";
import { CommitmentType } from "./useGetRolloverableCommitments";

export const useGetCommitmentsForCollateralTokensFromLiquidityPools = (
  collateralTokenAddress: string
) => {
  const chainId = useChainId();
  const graphURL = getLiquidityPoolsGraphEndpoint(chainId);

  const { convertCommitment } = useConvertLenderGroupCommitmentToCommitment();

  const collateralTokenCommitmentsDashboard = useMemo(
    () => gql`
      query groupDashboardCommitmentsFor${collateralTokenAddress} {
        groupPoolMetrics(
          where: { collateral_token_address: "${collateralTokenAddress}" }
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
    [collateralTokenAddress]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "commitmentsForLiquidityPoolsCollateralToken-",
      collateralTokenAddress,
    ],
    queryFn: async () => {
      const rawCommitments = await request(
        graphURL,
        collateralTokenCommitmentsDashboard
      );
      const commitments = await Promise.all(
        rawCommitments.groupPoolMetrics.map(convertCommitment)
      );
      return commitments;
    },
    enabled: !!collateralTokenAddress,
  }) as {
    data: CommitmentType[];
    isLoading: boolean;
    error: string;
  };

  if (error) console.error("commitmentsForCollateralToken Query error", error);

  return { data, isLoading };
};
