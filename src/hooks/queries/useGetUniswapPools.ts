import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";
import request, { gql } from "graphql-request";
import { useCallback, useState } from "react";
import { useChainId } from "wagmi";
import { UniswapV3Pool } from "../../constants/uniswapV3Pool.type";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

export interface UseGetUniswapV3LiquidityPoolsParams {
  /** The token address to search pools for */
  tokenAddress: string;
  /** The number of days to aggregate fees for (default: 30) */
  days?: number;
}

type PoolDayData = {
  date: number;
  feesUSD: string;
};

interface PoolsResponse {
  pools: UniswapV3Pool[];
}

interface PoolDayDatasResponse {
  poolDayDatas: PoolDayData[];
}

export interface UniswapPoolData {
  bestPool: UniswapV3Pool | null;
  poolDayDatas: PoolDayData[] | null;
  aggregatedFeesUSD: string;
}

// GraphQL queries
const UNISWAP_V3_POOLS_QUERY = gql`
  query UniswapV3PoolsByTokens($tokenAddress: String!) {
    pools(
      where: { or: [{ token0: $tokenAddress }, { token1: $tokenAddress }] }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      totalValueLockedUSD
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

const POOL_DAY_DATAS_QUERY = gql`
  query PoolDayDatas($poolId: String!, $dateGt: Int!) {
    poolDayDatas(
      where: { pool: $poolId, date_gt: $dateGt }
      orderBy: date
      orderDirection: asc
    ) {
      date
      feesUSD
    }
  }
`;

/**
 * Hook that returns a function to fetch Uniswap V3 pool data.
 * The returned function can be called multiple times or used in a map operation.
 *
 * @example
 * const { fetchPoolData, isLoading } = useGetUniswapPools();
 *
 * // Single fetch
 * const data = await fetchPoolData({ tokenAddress: "0x...", days: 30 });
 *
 * // Multiple fetches
 * const addresses = ["0x...", "0x..."];
 * const results = await Promise.all(
 *   addresses.map(addr => fetchPoolData({ tokenAddress: addr }))
 * );
 */
export const useGetUniswapPools = () => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  const queryClient = useQueryClient();
  const graphURL = getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPoolData = useCallback(
    async ({
      tokenAddress,
      days = 30,
    }: UseGetUniswapV3LiquidityPoolsParams) => {
      setIsLoading(true);
      try {
        const result = await queryClient.fetchQuery({
          queryKey: ["uniswapPoolData", chainId, tokenAddress, days],
          queryFn: async () => {
            // Step 1: Get the best pool
            const poolsResponse = await request<PoolsResponse>(
              graphURL || "",
              UNISWAP_V3_POOLS_QUERY,
              { tokenAddress }
            );

            const bestPool =
              poolsResponse.pools.length > 0 ? poolsResponse.pools[0] : null;

            if (!bestPool?.id) {
              return {
                bestPool: null,
                poolDayDatas: null,
                aggregatedFeesUSD: "0",
              };
            }

            // Step 2: Get pool day data
            const secondsAgo = days * 24 * 60 * 60;
            const daysAgoTimestamp = Math.floor(Date.now() / 1000) - secondsAgo;

            const dayDataResponse = await request<PoolDayDatasResponse>(
              graphURL || "",
              POOL_DAY_DATAS_QUERY,
              {
                poolId: bestPool.id,
                dateGt: daysAgoTimestamp,
              }
            );

            const poolDayDatas = dayDataResponse.poolDayDatas;

            // Step 3: Calculate aggregated fees
            let aggregatedFeesUSD = "0";
            if (poolDayDatas.length > 1) {
              const feesToAggregate = poolDayDatas.slice(0, -1);
              const totalFees = feesToAggregate.reduce(
                (acc: number, dayData: PoolDayData) =>
                  acc + parseFloat(dayData.feesUSD),
                0
              );
              aggregatedFeesUSD = totalFees.toString();
            }

            return {
              bestPool,
              poolDayDatas,
              aggregatedFeesUSD,
            };
          },
        });
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, graphURL, queryClient]
  );

  return { fetchPoolData, isLoading };
};
