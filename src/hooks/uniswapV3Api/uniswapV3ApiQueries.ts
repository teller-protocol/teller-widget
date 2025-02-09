import { gql } from 'graphql-request'

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
`

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
`
