import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useGetLiquidityPools } from "./useGetLiquidityPools";
import { TOKEN_ADDRESSES } from "../../constants/tokens";
import { supportedPrincipalTokens } from "../../constants/tokens";
import { useConvertLenderGroupCommitmentToCommitment } from "../useConvertLenderGroupCommitmentToCommitment";
import { UserToken } from "../useGetUserTokens";

export const convertCommitmentsToUniquePrincipalTokens = (commitments: any[]): UserToken[] => {
  const uniqueTokens = commitments.reduce((acc: UserToken[], commitment) => {
    if (!commitment?.principalToken?.address) return acc;

    const existingToken = acc.find(token => 
      token.address.toLowerCase() === commitment.principalToken.address.toLowerCase()
    );

    if (!existingToken) {
      acc.push({
        address: commitment.principalToken.address as `0x${string}`,
        name: commitment.principalToken.name || '',
        symbol: commitment.principalToken.symbol || '',
        logo: commitment.principalToken.imageUri || '',
        balance: '0',
        balanceBigInt: BigInt(0),
        decimals: commitment.principalToken.decimals || 18,
      });
    }

    return acc;
  }, []);

  return uniqueTokens;
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