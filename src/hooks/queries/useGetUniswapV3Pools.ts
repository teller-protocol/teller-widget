import { useQuery } from "@tanstack/react-query";
import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";
import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { UniswapV3Pool } from "../../constants/uniswapV3Pool.type";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

export const useGetLiquidityPools = () => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  const graphURL = getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId);

  // ------------------------------
  // Step 1: Get the "best" pool
  // ------------------------------

  // Query to fetch liquidity pools by token, ordered by totalValueLockedUSD descending.
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

  // Query to fetch liquidity pools.
  const bestPoolQuery = useQuery({
    queryKey: ["allLiquidityPools", chainId],
    queryFn: async () => {
      const response = await request(
        graphURL || "",
        getUniswapV3PoolsByToken,
        { tokenAddress: "0x594daad7d77592a2b97b725a7ad59d7e188b5bfa" }
      ) as { pools: UniswapV3Pool[] };

      // Return the first pool from the array (if any)
      return response.pools.length > 0 ? response.pools[0] : null;
    },
  });

  // Extract the pool id from the best pool.
  const poolId = bestPoolQuery.data?.id;

  // ------------------------------
  // Step 2: Query poolDayDatas for the best pool
  // ------------------------------

  // Compute a UNIX timestamp for 30 days ago
  const THIRTY_DAYS = 30 * 24 * 60 * 60;
  const thirtyDaysAgoTimestamp = Math.floor(Date.now() / 1000) - THIRTY_DAYS;

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

  // Use a second query that only runs when a valid poolId is available.
  const poolDayDatasQuery = useQuery({
    queryKey: ["poolDayDatas", poolId, thirtyDaysAgoTimestamp],
    queryFn: async () => {
      if (!poolId) return null;
      const response = await request(
        graphURL || "",
        getPoolDayDatasQuery,
        { poolId, dateGt: thirtyDaysAgoTimestamp }
      ) as { poolDayDatas: { date: number; feesUSD: string }[] };
      return response.poolDayDatas;
    },
    enabled: !!poolId, // Only run this query when poolId is available
  });

  // ------------------------------
  // Step 3: Aggregate feesUSD for the previous 30 days, excluding today
  // ------------------------------

  let aggregatedFeesUSD = "0";
  if (poolDayDatasQuery.data && poolDayDatasQuery.data.length > 1) {
    // The query results are sorted by date in ascending order.
    // We assume the last item is the most recent (today), so we exclude it.
    const feesToAggregate = poolDayDatasQuery.data.slice(0, -1);

    const totalFees = feesToAggregate.reduce((acc, dayData) => {
      // feesUSD is typically returned as a string. Convert it to a float before summing.
      return acc + parseFloat(dayData.feesUSD);
    }, 0);

    aggregatedFeesUSD = totalFees.toString();
  }

  console.log("bestPoolQuery.data", bestPoolQuery.data)
  console.log("aggregatedFeesUSD", aggregatedFeesUSD)

  return {
    bestPool: bestPoolQuery.data,                // The best pool object (or null)
    poolDayDatas: poolDayDatasQuery.data,          // Array of poolDayDatas for the pool
    aggregatedFeesUSD,                             // Total feesUSD over the previous 30 days (excluding today)
    isLoading: bestPoolQuery.isLoading || poolDayDatasQuery.isLoading,
    error: bestPoolQuery.error || poolDayDatasQuery.error,
  };
};
