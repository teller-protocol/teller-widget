import { Address, erc20Abi } from "viem";
import { readContract } from "wagmi/actions";
import request, { gql } from "graphql-request";
import { config } from "../../helpers/createWagmiConfig";
import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";
import uniswapV3PoolAbi from "../../contracts/UNISWAP_V3_POOL_ABI.json";
import { useChainId } from "wagmi";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useCallback, useState } from "react";
import { ChainNumbers } from "../../types/chainTypes";

export interface GetUniswapV3PoolUSDValueParams {
  /** The Uniswap V3 pool address */
  poolAddress: `0x${string}`;
}

interface TokenDerivedETHResponse {
  token?: {
    derivedETH: string;
  };
}

interface EthPriceResponse {
  bundle?: {
    ethPriceUSD: string;
  };
}

// GraphQL query to get the token's derived ETH value
const GET_TOKEN_DERIVED_ETH = gql`
  query GetTokenDerivedETH($tokenId: String!) {
    token(id: $tokenId) {
      derivedETH
    }
  }
`;

// GraphQL query to get the current ETH price in USD
const GET_ETH_PRICE_USD = gql`
  query GetEthPriceUSD {
    bundle(id: "1") {
      ethPriceUSD
    }
  }
`;

/**
 * Hook that returns a function to calculate the USD value of a Uniswap V3 pool.
 * The returned function can be called multiple times or used in a map operation.
 *
 * This function:
 *  1. Reads token0 and token1 addresses from the pool contract.
 *  2. Reads the token balances (via ERC‑20 balanceOf) held by the pool.
 *  3. Fetches each token's derived ETH value from the Uniswap V3 subgraph.
 *  4. Computes each token's USD price by multiplying its derived ETH value by the ETH price.
 *  5. Aggregates the total USD value.
 *
 * @example
 * const { getPoolUSDValue, isLoading } = useUniswapV3PoolUSDValue();
 *
 * // Single fetch
 * const data = await getPoolUSDValue({ poolAddress: "0x..." });
 *
 * // Multiple fetches
 * const addresses = ["0x...", "0x..."];
 * const results = await Promise.all(
 *   addresses.map(addr => getPoolUSDValue({ poolAddress: addr as `0x${string}` }))
 * );
 */
export const useUniswapV3PoolUSDValue = () => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  const [isLoading, setIsLoading] = useState(false);

  const getPoolUSDValue = useCallback(
    async ({ poolAddress }: GetUniswapV3PoolUSDValueParams) => {
      if (!chainId) {
        throw new Error("Chain ID is undefined");
      }

      setIsLoading(true);
      try {
        // 1. Get token addresses from the pool contract
        const token0Address = (await readContract(config, {
          address: poolAddress,
          abi: uniswapV3PoolAbi,
          functionName: "token0",
          chainId: chainId as ChainNumbers,
        })) as Address;

        const token1Address = (await readContract(config, {
          address: poolAddress,
          abi: uniswapV3PoolAbi,
          functionName: "token1",
          chainId: chainId as ChainNumbers,
        })) as Address;

        // Convert addresses to lowercase
        const token0AddressLower = token0Address.toLowerCase() as Address;
        const token1AddressLower = token1Address.toLowerCase() as Address;

        // 2. Get token balances held by the pool
        const token0Balance = await readContract(config, {
          address: token0AddressLower,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [poolAddress],
          chainId: chainId as ChainNumbers,
        });

        const token1Balance = await readContract(config, {
          address: token1AddressLower,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [poolAddress],
          chainId: chainId as ChainNumbers,
        });

        // 3. Setup subgraph queries
        const UNISWAP_V3_SUBGRAPH_URL = getUniswapV3GraphEndpointWithKey(
          subgraphApiKey,
          chainId
        );

        if (!UNISWAP_V3_SUBGRAPH_URL) {
          throw new Error("Subgraph URL is undefined");
        }

        // Fetch token0's derivedETH
        const token0DerivedETHResponse = await request<TokenDerivedETHResponse>(
          UNISWAP_V3_SUBGRAPH_URL,
          GET_TOKEN_DERIVED_ETH,
          {
            tokenId: token0AddressLower,
          }
        );
        const token0DerivedETH =
          token0DerivedETHResponse?.token?.derivedETH ?? "0";

        // Fetch token1's derivedETH
        const token1DerivedETHResponse = await request<TokenDerivedETHResponse>(
          UNISWAP_V3_SUBGRAPH_URL,
          GET_TOKEN_DERIVED_ETH,
          {
            tokenId: token1AddressLower,
          }
        );
        const token1DerivedETH =
          token1DerivedETHResponse?.token?.derivedETH ?? "0";

        // 4. Fetch the current ETH price in USD
        const ethPriceResponse = await request<EthPriceResponse>(
          UNISWAP_V3_SUBGRAPH_URL,
          GET_ETH_PRICE_USD
        );
        const ethPrice = parseFloat(
          ethPriceResponse?.bundle?.ethPriceUSD ?? "0"
        );

        // 5. Calculate token USD prices
        const token0USDPrice = parseFloat(token0DerivedETH) * ethPrice;
        const token1USDPrice = parseFloat(token1DerivedETH) * ethPrice;

        // 6. Compute total USD value
        const value0 = parseFloat(token0Balance.toString()) * token0USDPrice;
        const value1 = parseFloat(token1Balance.toString()) * token1USDPrice;
        const totalUSDValue = (value0 + value1) / 10 ** 18;

        return {
          totalUSDValue,
          error: null,
        };
      } catch (error) {
        console.error("Error calculating pool USD value:", error);
        return {
          totalUSDValue: 0,
          error,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, subgraphApiKey]
  );

  return { getPoolUSDValue, isLoading };
};
