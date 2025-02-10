import { useQuery } from "@tanstack/react-query";
import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { UniswapV3Pool } from "../../constants/uniswapV3Pool.type";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

export interface UseGetUniswapV3LiquidityPoolsParams {
  /** The token address to search pools for */
  tokenAddress: string;
  /** The number of days to aggregate fees for (default: 30) */
  days?: number;
}

/**
 * Hook to fetch liquidity pool data from Uniswap V3 based on a token address.
 *
 * This hook performs the following steps:
 *
 * 1. It queries for pools that have the given token as token0 or token1,
 *    ordered by `totalValueLockedUSD` in descending order, and selects the "best" pool.
 *
 * 2. It queries for `poolDayDatas` for that best pool starting from (days ago)
 *    until today.
 *
 * 3. It aggregates the `feesUSD` for the period (excluding the most recent day).
 *
 * @param params.tokenAddress The token address to fetch liquidity pools for.
 * @param params.days (Optional) The number of days to aggregate fees (default is 30).
 */
export const useGetUniswapV3LiquidityPools = ({
  tokenAddress,
  days = 30,
}: UseGetUniswapV3LiquidityPoolsParams) => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  const graphURL = getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId);

  // ------------------------------
  // Step 1: Get the "best" pool for the given token.
  // ------------------------------

  // Query to fetch liquidity pools by token address, ordered by totalValueLockedUSD descending.
  const getUniswapV3PoolsByToken = useMemo(
    () => gql`
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
    `,
    []
  );

  const bestPoolQuery = useQuery({
    queryKey: ["allLiquidityPools", chainId, tokenAddress],
    queryFn: async () => {
      const response = (await request(
        graphURL || "",
        getUniswapV3PoolsByToken,
        { tokenAddress }
      )) as { pools: UniswapV3Pool[] };

      // Return the first pool from the array (if any)
      return response.pools.length > 0 ? response.pools[0] : null;
    },
  });

  // Extract the pool id from the best pool.
  const poolId = bestPoolQuery.data?.id;

  // ------------------------------
  // Step 2: Query poolDayDatas for the best pool.
  // ------------------------------

  // Compute a UNIX timestamp for the number of days ago.
  const secondsAgo = days * 24 * 60 * 60;
  const daysAgoTimestamp = Math.floor(Date.now() / 1000) - secondsAgo;

  // Query to fetch poolDayDatas for a given pool and date filter.
  const getPoolDayDatasQuery = useMemo(
    () => gql`
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
    `,
    []
  );

  // Query for poolDayDatas that only runs when a valid poolId is available.
  const poolDayDatasQuery = useQuery({
    queryKey: ["poolDayDatas", poolId, daysAgoTimestamp],
    queryFn: async () => {
      if (!poolId) return null;
      const response = (await request(
        graphURL || "",
        getPoolDayDatasQuery,
        { poolId, dateGt: daysAgoTimestamp }
      )) as { poolDayDatas: { date: number; feesUSD: string }[] };
      return response.poolDayDatas;
    },
    enabled: !!poolId,
  });

  // ------------------------------
  // Step 3: Aggregate feesUSD for the given period (excluding the most recent day).
  // ------------------------------

  let aggregatedFeesUSD = "0";
  if (poolDayDatasQuery.data && poolDayDatasQuery.data.length > 1) {
    // Assume the query results are sorted by date in ascending order.
    // Exclude the most recent day (last item) from the aggregation.
    const feesToAggregate = poolDayDatasQuery.data.slice(0, -1);
    const totalFees = feesToAggregate.reduce((acc, dayData) => {
      return acc + parseFloat(dayData.feesUSD);
    }, 0);
    aggregatedFeesUSD = totalFees.toString();
  }

  return {
    bestPool: bestPoolQuery.data,         // The best pool object (or null)
    poolDayDatas: poolDayDatasQuery.data,   // Array of poolDayDatas for the pool
    aggregatedFeesUSD,                      // Total feesUSD over the previous period (excluding today)
    isLoading: bestPoolQuery.isLoading || poolDayDatasQuery.isLoading,
    error: bestPoolQuery.error || poolDayDatasQuery.error,
  };
};
