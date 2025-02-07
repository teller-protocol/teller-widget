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
  const { singleWhitelistedToken } = useGetGlobalPropsContext();

  const poolCommitmentsDashboard = useMemo(
    () => gql`
      query groupLiquidityPools {
        groupPoolMetrics(
          where: ${singleWhitelistedToken ? `{ collateral_token_address: "${singleWhitelistedToken.toLocaleLowerCase()}" }` : "{}"}
          orderBy: principal_token_address
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

  const { data: blockedPools } = useQuery({
    queryKey: ["blockedPools", chainId],
    queryFn: async () => {
      const response = await fetch(`https://xyon-xymz-1ofj.n7d.xano.io/api:x0wU2WHq/no_show_pools_by_network?network_id=${chainId}`);
      const data = await response.json();
      return data.map((pool: any) => pool.pool_id.toLowerCase());
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["allLiquidityPools", chainId, blockedPools],
    queryFn: async () => {
      const response = await request(graphURL, poolCommitmentsDashboard) as { 
        groupPoolMetrics: LenderGroupsPoolMetrics[] 
      };

      console.log("blockedPools", blockedPools)
      console.log("response.groupPoolMetrics", response.groupPoolMetrics)

      const filteredPools = blockedPools?.length 
        ? response.groupPoolMetrics.filter(pool => !blockedPools.includes(pool.group_pool_address.toLowerCase()))
        : response.groupPoolMetrics;

      return filteredPools;
    },
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { liquidityPools: data || [], isLoading };
};
