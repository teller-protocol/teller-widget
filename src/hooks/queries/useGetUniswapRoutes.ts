import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";
import request, { gql } from "graphql-request";
import { useState, useEffect } from "react";
import { useChainId } from "wagmi";
import { UniswapV3Pool } from "../../constants/uniswapV3Pool.type";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { TOKEN_ADDRESSES } from "../../constants/tokens";

interface PoolsResponse {
  pools: UniswapV3Pool[];
}

const UNISWAP_V3_POOLS_BY_TOKEN_QUERY = gql`
  query PoolsByToken($token: String!) {
    pools(
      where: { or: [{ token0: $token }, { token1: $token }] }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      totalValueLockedUSD
      feeTier
      token0 { id decimals }
      token1 { id decimals }
    }
  }
`

const UNISWAP_V3_POOLS_BY_PAIR_QUERY = gql`
  query PoolsByPair($token0: String!, $token1: String!) {
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
      id
      totalValueLockedUSD
      feeTier
      token0 { id decimals }
      token1 { id decimals }
    }
  }
`

const UNIV3_LIQUIDITY_MIN = 500

export const useBestUniswapV3Route = (
  principalTokenAddress?: string,
  collateralTokenAddress?: string
) => {
  const chainId = useChainId()
  const { subgraphApiKey } = useGetGlobalPropsContext()
  const graphURL = getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId)

  const [route, setRoute] = useState<{
    pools: any[]
    liquidityInsufficient: boolean
  }>({
    pools: [],
    liquidityInsufficient: true,
  })

  useEffect(() => {
    const getRoute = async () => {
      if (!principalTokenAddress || !collateralTokenAddress || !graphURL) return

      const isCollateralWETH =
        collateralTokenAddress.toLowerCase() ===
        TOKEN_ADDRESSES[chainId ?? 1]['WETH'].toLowerCase()

      const tempCollateralToken = isCollateralWETH
        ? principalTokenAddress
        : collateralTokenAddress
      const tempPrincipalToken = isCollateralWETH
        ? collateralTokenAddress
        : principalTokenAddress

      // Step 1: Get pools involving the collateral token
      const { pools: collateralPools } = await request<PoolsResponse>(
        graphURL,
        UNISWAP_V3_POOLS_BY_TOKEN_QUERY,
        { token: tempCollateralToken.toLowerCase() }
      )

      const firstCollateralPool = collateralPools?.[0]
      if (!firstCollateralPool) return
      
      const collateralLiquidity = parseFloat(firstCollateralPool.totalValueLockedUSD || '0')

      const isDirectRoute =
        (firstCollateralPool.token0.id.toLowerCase() === collateralTokenAddress.toLowerCase() &&
          firstCollateralPool.token1.id.toLowerCase() === principalTokenAddress.toLowerCase()) ||
        (firstCollateralPool.token0.id.toLowerCase() === principalTokenAddress.toLowerCase() &&
          firstCollateralPool.token1.id.toLowerCase() === collateralTokenAddress.toLowerCase())

      const pool1 = [
        firstCollateralPool.id,
        firstCollateralPool.token0.id.toLowerCase() === collateralTokenAddress.toLowerCase(),
        Number(firstCollateralPool.feeTier),
        Number(firstCollateralPool.token0.decimals),
        Number(firstCollateralPool.token1.decimals),
      ]

      if (isDirectRoute) {
        setRoute({
          pools: [pool1],
          liquidityInsufficient: collateralLiquidity < UNIV3_LIQUIDITY_MIN,
        })
        return
      }

      // Step 2: Use intermediary token
      const intermediaryToken =
        firstCollateralPool.token0.id.toLowerCase() === collateralTokenAddress.toLowerCase()
          ? firstCollateralPool.token1.id
          : firstCollateralPool.token0.id

      const { pools: principalPools } = await request<PoolsResponse>(
        graphURL,
        UNISWAP_V3_POOLS_BY_PAIR_QUERY,
        {
          token0: principalTokenAddress.toLowerCase(),
          token1: intermediaryToken.toLowerCase(),
        }
      )

      const firstPrincipalPool = principalPools?.[0]
      if (!firstPrincipalPool) return

      const principalLiquidity = parseFloat(firstPrincipalPool.totalValueLockedUSD || '0')

      const pool2 = [
        intermediaryToken.toLowerCase(),
        firstPrincipalPool.token0.id.toLowerCase() === intermediaryToken.toLowerCase(),
        Number(firstPrincipalPool.feeTier),
        Number(firstPrincipalPool.token0.decimals),
        Number(firstPrincipalPool.token1.decimals),
      ]

      setRoute({
        pools: [pool2, pool1],
        liquidityInsufficient:
          collateralLiquidity < UNIV3_LIQUIDITY_MIN ||
          principalLiquidity < UNIV3_LIQUIDITY_MIN,
      })
    }

    getRoute()
  }, [principalTokenAddress, collateralTokenAddress, chainId, graphURL])

  return route
}