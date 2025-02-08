import { useQuery, useMemo } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useGetLiquidityPools } from "./useGetLiquidityPools";
import { TOKEN_ADDRESSES } from "../../constants/tokens";
import { supportedPrincipalTokens } from "../../constants/tokens";
import { useConvertLenderGroupCommitmentToCommitment } from "../useConvertLenderGroupCommitmentToCommitment";
import { UserToken } from "../useGetUserTokens";

export const useGetCommitmentsForErc20TokensByPrincipalToken = (principalTokenAddress?: string) => {
  const { erc20sWithCommitments, isLoading } = useGetCommitmentsForErc20Tokens();

  const filteredCommitments = useMemo(() => {
    if (!principalTokenAddress) return [];
    return erc20sWithCommitments.filter(
      commitment => commitment?.principalToken?.address?.toLowerCase() === principalTokenAddress?.toLowerCase()
    );
  }, [erc20sWithCommitments, principalTokenAddress]);

  return { erc20sWithCommitments: filteredCommitments, isLoading };
};

export const useGetCommitmentsForErc20Tokens = () => {
  const chainId = useChainId();
  const { convertCommitment } = useConvertLenderGroupCommitmentToCommitment();
  
  const {
    liquidityPools: liquidityPools, 
    isLoading: liquidityPoolsLoading, 
  } = useGetLiquidityPools();
  
  const chainTokenAddresses = supportedPrincipalTokens
    .map((token: string) => TOKEN_ADDRESSES[chainId]?.[token])  
    .filter((token: string) => typeof token === 'string') as string[];

  const { data, isLoading, error } = useQuery({
    queryKey: ["allLiquidityPools", chainId, chainTokenAddresses],
    queryFn: async () => {
      if (!Array.isArray(liquidityPools) || liquidityPools.length === 0) {
        console.warn("No liquidity pools available for filtering");
        return [];
      }

      const filteredPools = liquidityPools.filter(pool =>
        !chainTokenAddresses.includes(pool.principal_token_address?.toLowerCase())
      );

      const commitments = await Promise.all(
        filteredPools.map(convertCommitment)
      );
      return commitments;
    },
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { erc20sWithCommitments: data || [], isLoading };
};