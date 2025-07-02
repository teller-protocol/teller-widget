import { gql } from "graphql-request";

export const getUniswapV3PoolsByToken = gql`
  query UniswapV3PoolsByTokens($token0: String!) {
    pools(
      where: { or: [{ token0: $token0 }, { token1: $token0 }] }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      totalValueLockedUSD
      id
      token0 {
        id
        decimals
      }
      token1 {
        id
        decimals
      }
    }
  }
`;

export const getUniswapV3PoolsByTokensPair = gql`
  query UniswapV3PoolsByTokens($token0: String!, $token1: String!) {
    pools(
      where: {
        or: [
          { token0: $token0, token1: $token1 }
          { token0: $token1, token1: $token0 }
        ]
      }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      totalValueLockedUSD
      feeTier
      id
      token0 {
        id
        decimals
      }
      token1 {
        id
        decimals
      }
    }
  }
`;

export const getTokenDerivedETH = gql`
  query GetTokenDerivedETH($tokenId: String!) {
    token(id: $tokenId) {
      derivedETH
    }
  }
`;

// GraphQL query to get the current ETH price in USD
export const getEthPriceUSD = gql`
  query GetEthPriceUSD {
    bundle(id: "1") {
      ethPriceUSD
    }
  }
`;
