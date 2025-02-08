import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useGetLiquidityPools } from "./useGetLiquidityPools";
import { TOKEN_ADDRESSES } from "../../constants/tokens";
import { supportedPrincipalTokens } from "../../constants/tokens";
import { CommitmentType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";
import { useConvertLenderGroupCommitmentToCommitment } from "../useConvertLenderGroupCommitmentToCommitment";
import { useGetTokenMetadata } from "../useGetTokenMetadata";
import { UserToken } from "../useGetUserTokens";

export const useGeCommitmentsForErc20Tokens = () => {
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
        return { commitments: [], principalTokens: [] };
      }

      const filteredPools = liquidityPools.filter(pool =>
        !chainTokenAddresses.includes(pool.principal_token_address?.toLowerCase())
      );

      const commitments = await Promise.all(
        filteredPools.map(convertCommitment)
      );
      
      const uniquePrincipalAddresses = Array.from(
        new Set(commitments.map(c => c?.principalTokenAddress))
      ).filter(Boolean);

      const principalTokenPromises = uniquePrincipalAddresses.map(async (address) => {
        try {
          const alchemy = useAlchemy();
          const metadata = await alchemy.core.getTokenMetadata(address as string);
          if (!metadata) return null;

          const token: UserToken = {
            address: address as `0x${string}`,
            name: metadata.name || '',
            symbol: metadata.symbol || '',
            logo: metadata.logo || '',
            balance: '0',
            balanceBigInt: BigInt(0),
            decimals: metadata.decimals || 18,
          };
          return token;
        } catch (error) {
          console.error(`Error fetching metadata for token ${address}:`, error);
          return null;
        }
      });

      const principalTokens = (await Promise.all(principalTokenPromises))
        .filter((token): token is UserToken => token !== null);

      console.log("commitments", commitments)
      console.log("principalTokens", principalTokens)
      
      return { commitments, principalTokens };
      
    },
  });

  if (error) console.error("allLiquidityPools Query error", error);

  return { 
    erc20sWithCommitments: data?.commitments || [], 
    principalErc20Tokens: data?.principalTokens || [],
    isLoading 
  };
};