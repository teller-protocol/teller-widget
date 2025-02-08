import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useGetLiquidityPools } from "./useGetLiquidityPools";
import { TOKEN_ADDRESSES } from "../../constants/tokens";
import { supportedPrincipalTokens } from "../../constants/tokens";

// filter out all weth / usdc lending tokens ie supportedPrincipalTokens

export const useGeCommitmentsForErc20Tokens = () => {
  const chainId = useChainId();
  
  const {
    liquidityPools: liquidityPools, 
    isLoading: liquidityPoolsLoading, 
  } = useGetLiquidityPools();

  console.log("liquidityPools", liquidityPools)
  
  const chainTokenAddresses = supportedPrincipalTokens
    .map((token: string) => TOKEN_ADDRESSES[chainId]?.[token])  
    .filter((token: string) => typeof token === 'string') as string[];

  console.log("chainTokenAddresses", chainTokenAddresses)

  const { data, isLoading, error } = useQuery({
    queryKey: ["allLiquidityPools", chainId, chainTokenAddresses],
    queryFn: async () => {

      const filteredPools = chainTokenAddresses?.length 
        ? liquidityPools.filter(pool => !chainTokenAddresses.includes(pool.principal_token_address.toLowerCase()))
        : liquidityPools;

      return filteredPools;
    },
  });

  console.log("data", data)

  if (error) console.error("allLiquidityPools Query error", error);

  return { liquidityPools: data || [], isLoading };
};