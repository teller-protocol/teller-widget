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
      first: 1
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
      first: 1
    ) {
      id
      totalValueLockedUSD
      feeTier
      token0 { id decimals }
      token1 { id decimals }
    }
  }
`

const UNIV3_LIQUIDITY_MIN = 10000

// In-memory route cache
const routeCache = new Map<string, { pools: any[]; liquidityInsufficient: boolean }>();

export const useBestUniswapV3Route = (
  principalTokenAddress?: string,
  finalTokenAddress?: string
) => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  const graphURL = getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId);

  const [route, setRoute] = useState<{
    pools: any[];
    liquidityInsufficient: boolean;
  }>({
    pools: [],
    liquidityInsufficient: true,
  });

  useEffect(() => {
    const getRoute = async () => {
      if (!principalTokenAddress || !finalTokenAddress || !graphURL || !chainId) return;

      const cacheKey = `${chainId}-${principalTokenAddress.toLowerCase()}-${finalTokenAddress.toLowerCase()}`;
      const cached = routeCache.get(cacheKey);

      if (cached) {
        setRoute(cached);
        return;
      }
      
      try {
        // Step 1: Get pools involving the collateral token
        const { pools: collateralPools } = await request<PoolsResponse>(
          graphURL,
          UNISWAP_V3_POOLS_BY_TOKEN_QUERY,
          { token: finalTokenAddress.toLowerCase() }
        );

        const firstCollateralPool = collateralPools?.[0];
        if (!firstCollateralPool) return;

        const collateralLiquidity = parseFloat(firstCollateralPool.totalValueLockedUSD || '0');

        const isDirectRoute =
          (firstCollateralPool.token0.id.toLowerCase() === finalTokenAddress.toLowerCase() &&
            firstCollateralPool.token1.id.toLowerCase() === principalTokenAddress.toLowerCase()) ||
          (firstCollateralPool.token0.id.toLowerCase() === principalTokenAddress.toLowerCase() &&
            firstCollateralPool.token1.id.toLowerCase() === finalTokenAddress.toLowerCase());

        const pool1 = [
          finalTokenAddress,
          firstCollateralPool.token0.id.toLowerCase() === finalTokenAddress.toLowerCase(),
          Number(firstCollateralPool.feeTier),
          Number(firstCollateralPool.token0.decimals),
          Number(firstCollateralPool.token1.decimals),
        ];

        if (isDirectRoute) {
          const result = {
            pools: [pool1],
            liquidityInsufficient: collateralLiquidity < UNIV3_LIQUIDITY_MIN,
          };
          routeCache.set(cacheKey, result);
          setRoute(result);
          return;
        }

        // Step 2: Use intermediary token
        const intermediaryToken =
          firstCollateralPool.token0.id.toLowerCase() === finalTokenAddress.toLowerCase()
            ? firstCollateralPool.token1.id
            : firstCollateralPool.token0.id;

        const { pools: principalPools } = await request<PoolsResponse>(
          graphURL,
          UNISWAP_V3_POOLS_BY_PAIR_QUERY,
          {
            token0: principalTokenAddress.toLowerCase(),
            token1: intermediaryToken.toLowerCase(),
          }
        );

        const firstPrincipalPool = principalPools?.[0];
        if (!firstPrincipalPool) return;

        const principalLiquidity = parseFloat(firstPrincipalPool.totalValueLockedUSD || '0');

        const pool2 = [
          intermediaryToken,
          firstPrincipalPool.token0.id.toLowerCase() === intermediaryToken.toLowerCase(),
          Number(firstPrincipalPool.feeTier),
          Number(firstPrincipalPool.token0.decimals),
          Number(firstPrincipalPool.token1.decimals),
        ];

        const result = {
          pools: [pool2, pool1],
          liquidityInsufficient:
            collateralLiquidity < UNIV3_LIQUIDITY_MIN ||
            principalLiquidity < UNIV3_LIQUIDITY_MIN,
        };

        routeCache.set(cacheKey, result);
        setRoute(result);
      } catch (err) {
        console.error("Uniswap route fetch failed", err);
      }
    };

    getRoute();
  }, [principalTokenAddress, finalTokenAddress, chainId, graphURL]);

  return route;
};
