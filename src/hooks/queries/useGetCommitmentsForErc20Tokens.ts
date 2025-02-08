import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useGetLiquidityPools } from "./useGetLiquidityPools";
import { supportedPrincipalTokens } from "../../constants/supportedTokens";

// filter out all weth / usdc lending tokens ie supportedPrincipalTokens

export const useGeCommitmentsForErc20Tokens = () => {
  const chainId = useChainId();
  const { singleWhitelistedToken } = useGetGlobalPropsContext();
  
  const { liquidityPools: liquidityPools, isLoading: liquidityPoolsLoading, } = useGetLiquidityPools();

  const { data, isLoading, error } = useQuery({
    queryKey: ["allLiquidityPools", chainId, blockedPools],
    queryFn: async () => {
      const response = await request(graphURL, poolCommitmentsDashboard) as { 
        groupPoolMetrics: LenderGroupsPoolMetrics[] 
      };

      const filteredPools = blockedPools?.length 
        ? response.groupPoolMetrics.filter(pool => !blockedPools.includes(pool.group_pool_address.toLowerCase()))
        : response.groupPoolMetrics;

      return filteredPools;
    },
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { liquidityPools: data || [], isLoading };
};