import { useQuery } from "@tanstack/react-query";
import { getLiquidityPoolsGraphEndpoint } from "../../constants/liquidityPoolsGraphEndpoints";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import {
  GetLenderGroupsRolloverableCommitmentsResponse,
  LenderGroupsPoolMetrics,
} from "../../types/lenderGroupsPoolMetrics";
import { useChainId } from "wagmi";
import { useConvertLenderGroupCommitmentToCommitment } from "../useConvertLenderGroupCommitmentToCommitment";
import { CommitmentType } from "./useGetRolloverableCommitments";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

export const useGetCommitmentsForCollateralTokensFromLiquidityPools = (
  collateralTokenAddress: string
) => {
  const chainId = useChainId();
  const graphURL = getLiquidityPoolsGraphEndpoint(chainId);
  const { principalTokenForPair } = useGetGlobalPropsContext();

  const { convertCommitment } = useConvertLenderGroupCommitmentToCommitment();

  const collateralTokenCommitmentsDashboard = useMemo(
    () => gql`
      query groupDashboardCommitmentsFor${collateralTokenAddress} {
        group_pool_metric(
          where: {
            collateral_token_address: {_eq: "${collateralTokenAddress?.toLowerCase()}" }
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
    [collateralTokenAddress, principalTokenForPair]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "teller-widget",
      "commitmentsForLiquidityPoolsCollateralToken-",
      collateralTokenAddress,
      chainId,
    ],
    queryFn: async () => {
      const rawCommitments =
        await request<GetLenderGroupsRolloverableCommitmentsResponse>(
          graphURL,
          collateralTokenCommitmentsDashboard
        );

      const filteredCommitments = rawCommitments.group_pool_metric.filter(
        (pool: any) => {
          const committed = BigInt(pool?.total_principal_tokens_committed ?? 0);
          const withdrawn = BigInt(pool?.total_principal_tokens_withdrawn ?? 0);
          const interest = BigInt(pool?.total_interest_collected ?? 0);
          const trueLiquidity = committed - (withdrawn + interest);

          return trueLiquidity > 0n;
        }
      );

      const commitments = await Promise.all(
        filteredCommitments.map(convertCommitment)
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
