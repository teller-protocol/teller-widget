// useTokenUSDPrice.ts
import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";

// Uniswap V3 subgraph endpoint (adjust if needed)
const UNISWAP_V3_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// GraphQL query to get the token’s derived ETH value
const GET_TOKEN_DERIVED_ETH = gql`
  query GetTokenDerivedETH($tokenId: String!) {
    token(id: $tokenId) {
      derivedETH
    }
  }
`;

/**
 * Fetches the derivedETH value for a given token from the Uniswap V3 subgraph.
 *
 * @param tokenId The token's address in lowercase.
 * @returns A Promise resolving to the token's derived ETH value as a string.
 */
const fetchTokenDerivedETH = async (tokenId: string): Promise<string> => {
  const data = await request(UNISWAP_V3_SUBGRAPH_URL, GET_TOKEN_DERIVED_ETH, { tokenId });
  // Define a type for the data
  type TokenData = {
    token: {
      derivedETH: string;
    };
  };
  // Use the defined type
  return (data as TokenData).token.derivedETH;
};

// CoinGecko API endpoint for ETH price in USD
const COINGECKO_ETH_PRICE_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

/**
 * Fetches the current price of ETH in USD from CoinGecko.
 *
 * @returns A Promise resolving to ETH's USD price as a number.
 */
const fetchETHPrice = async (): Promise<number> => {
  const res = await fetch(COINGECKO_ETH_PRICE_API);
  if (!res.ok) {
    throw new Error("Failed to fetch ETH price from CoinGecko");
  }
  const data = await res.json();
  return data.ethereum.usd;
};

/**
 * Custom hook to calculate a token's price in USD.
 *
 * @param tokenId The token's address (in lowercase) to query from the subgraph.
 * @returns An object with the token's USD price, loading state, and error (if any).
 */
export const useTokenUSDPrice = (tokenId: string) => {
  // Query the subgraph for the token's derived ETH value.
  const {
    data: derivedETH,
    isLoading: loadingDerived,
    error: errorDerived,
  } = useQuery({ queryKey: ["token-derived-eth", tokenId], queryFn: () => fetchTokenDerivedETH(tokenId) });
  
  // Query CoinGecko for the current ETH price in USD.
  const {
    data: ethPrice,
    isLoading: loadingEthPrice,
    error: errorEthPrice,  
  } = useQuery({ queryKey: ["eth-price"], queryFn: fetchETHPrice });

  // Combine the loading and error states.
  const isLoading = loadingDerived || loadingEthPrice;
  const error = errorDerived || errorEthPrice;

  // Calculate the token's USD price:
  // tokenUSDPrice = derivedETH (ETH per token) * ETH price in USD
  const tokenUSDPrice =
    derivedETH && ethPrice ? parseFloat(derivedETH) * ethPrice : undefined;

  console.log("tokenUSDPrice", tokenUSDPrice)

  return { tokenUSDPrice, isLoading, error };
};
