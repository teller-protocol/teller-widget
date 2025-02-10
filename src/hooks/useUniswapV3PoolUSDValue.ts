// useUniswapV3PoolUSDValue.ts
import { useReadContract, ContractType } from "./useReadContract";
import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useChainId } from "wagmi";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import { getUniswapV3GraphEndpointWithKey } from "../constants/graphEndpoints";

export interface UseUniswapV3PoolUSDValueParams {
  /** The Uniswap V3 pool address */
  poolAddress: string;
}

/**
 * Hook to estimate the total USD value held in a Uniswap V3 pool.
 *
 * This hook:
 *  1. Reads token0 and token1 addresses from the pool contract.
 *  2. Reads the token balances (via ERC‑20 balanceOf) held by the pool.
 *  3. Fetches each token's derived ETH value from the Uniswap V3 subgraph.
 *  4. Computes each token's USD price by multiplying its derived ETH value by the passed-in ETH price.
 *  5. Aggregates the total USD value.
 *
 * @param params.poolAddress The address of the Uniswap V3 pool contract.
 * @param params.ethPrice The current ETH price in USD.
 */
export const useUniswapV3PoolUSDValue = ({
  poolAddress,
}: UseUniswapV3PoolUSDValueParams) => {
  // 1. Get token addresses from the pool contract.
  const {
    data: token0Address,
    isLoading: token0AddrLoading,
    error: token0AddrError,
  } = useReadContract(poolAddress, "token0", [], false, ContractType.UNIV3POOL);

  const {
    data: token1Address,
    isLoading: token1AddrLoading,
    error: token1AddrError,
  } = useReadContract(poolAddress, "token1", [], false, ContractType.UNIV3POOL);

  // Keep the "0x" prefix; simply convert to lowercase.
  const token0AddressLower = token0Address
    ? (token0Address as string).toLowerCase()
    : "";
  const token1AddressLower = token1Address
    ? (token1Address as string).toLowerCase()
    : "";

  // 2. Get token balances held by the pool.
  // (We assume that token0AddressLower and token1AddressLower already include the "0x" prefix.)
  const {
    data: token0Balance,
    isLoading: token0BalLoading,
    error: token0BalError,
  } = useReadContract(
    token0AddressLower,
    "balanceOf",
    [poolAddress],
    false,
    ContractType.ERC20
  );

  const {
    data: token1Balance,
    isLoading: token1BalLoading,
    error: token1BalError,
  } = useReadContract(
    token1AddressLower,
    "balanceOf",
    [poolAddress],
    false,
    ContractType.ERC20
  );

  // 3. Setup subgraph queries to fetch derived ETH values.
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  const UNISWAP_V3_SUBGRAPH_URL = getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId);

  // GraphQL query to get the token's derived ETH value.
  const GET_TOKEN_DERIVED_ETH = gql`
    query GetTokenDerivedETH($tokenId: String!) {
      token(id: $tokenId) {
        derivedETH
      }
    }
  `;

  // Fetch function with logging and error handling.
  const fetchTokenDerivedETH = async (tokenId: string): Promise<string | null> => {
    try {
      const data = await request(UNISWAP_V3_SUBGRAPH_URL!, GET_TOKEN_DERIVED_ETH, {
        tokenId,
      });
      if (!data || !data.token) {
        console.warn("Token not found in subgraph for", tokenId);
        return null;
      }
      return data.token.derivedETH;
    } catch (error) {
      console.error("Error fetching derivedETH for", tokenId, error);
      return null;
    }
  };

  // Query for token0's derivedETH.
  const {
    data: token0DerivedETH,
    isLoading: token0DerivedLoading,
    error: token0DerivedError,
  } = useQuery({
    queryKey: ["token-derived-eth", token0AddressLower],
    queryFn: () => fetchTokenDerivedETH(token0AddressLower),
    enabled: !!token0AddressLower,
  });

  // Query for token1's derivedETH.
  const {
    data: token1DerivedETH,
    isLoading: token1DerivedLoading,
    error: token1DerivedError,
  } = useQuery({
    queryKey: ["token-derived-eth", token1AddressLower],
    queryFn: () => fetchTokenDerivedETH(token1AddressLower),
    enabled: !!token1AddressLower,
  });

  // 4. Fetch the current ETH price in USD from the subgraph.
  // The Uniswap subgraph exposes the ETH price via the "bundle" entity.
  const GET_ETH_PRICE_USD = gql`
    query GetEthPriceUSD {
      bundle(id: "1") {
        ethPriceUSD
      }
    }
  `;

  const fetchEthPriceUSD = async (): Promise<number | null> => {
    try {
      const data = await request(UNISWAP_V3_SUBGRAPH_URL!, GET_ETH_PRICE_USD);
      if (!data || !data.bundle) {
        console.warn("ETH price not found in subgraph");
        return null;
      }
      return parseFloat(data.bundle.ethPriceUSD);
    } catch (error) {
      console.error("Error fetching ETH price", error);
      return null;
    }
  };

  const {
    data: fetchedEthPrice,
    isLoading: ethPriceLoading,
    error: ethPriceError,
  } = useQuery({
    queryKey: ["eth-price-usd"],
    queryFn: fetchEthPriceUSD,
    enabled: !!UNISWAP_V3_SUBGRAPH_URL,
  });

  // 4. Calculate each token's USD price (derivedETH * ETH price).
  const token0USDPrice =
    token0DerivedETH && fetchedEthPrice
      ? parseFloat(token0DerivedETH) * fetchedEthPrice
      : undefined;
  const token1USDPrice =
    token1DerivedETH && fetchedEthPrice
      ? parseFloat(token1DerivedETH) * fetchedEthPrice
      : undefined;

  // 5. Compute the total USD value of the pool's tokens.
  let totalUSDValue = 0;
  if (
    token0Balance &&
    token1Balance &&
    token0USDPrice !== undefined &&
    token1USDPrice !== undefined
  ) {
    const value0 = parseFloat(token0Balance.toString()) * token0USDPrice;
    const value1 = parseFloat(token1Balance.toString()) * token1USDPrice;
    totalUSDValue = (value0 + value1)/(10**18);
  }

  const isLoading =
    token0AddrLoading ||
    token1AddrLoading ||
    token0BalLoading ||
    token1BalLoading ||
    token0DerivedLoading ||
    token1DerivedLoading || 
    ethPriceLoading;
  const error =
    token0AddrError ||
    token1AddrError ||
    token0BalError ||
    token1BalError ||
    token0DerivedError ||
    token1DerivedError ||
    ethPriceError;

  return { totalUSDValue, isLoading, error };
};
