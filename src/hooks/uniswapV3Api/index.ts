import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'
import { UniswapV3Pool } from '../../constants/uniswapV3Pool.type'
import { getSubgraphURL } from './uniswapV3Config'
import {
  getUniswapV3PoolsByToken,
  getUniswapV3PoolsByTokensPair,
} from '../uniswapV3Api/uniswapV3ApiQueries'

// Custom baseQuery that changes URL dynamically based on chainId
const dynamicBaseQuery: BaseQueryFn<
  { chainId: number; body: { document: any; variables: any } }, // Define input types
  unknown, // Define result types
  unknown // Define error types
> = async ({ chainId, body }, api, extraOptions) => {
  const url = getSubgraphURL(chainId) // Generate the URL based on chainId
  const baseQuery = graphqlRequestBaseQuery({ url }) // Use graphqlRequestBaseQuery with the new URL

  return baseQuery(body, api, extraOptions) // Pass all required arguments to the baseQuery
}

export const uniswapV3Api = createApi({
  reducerPath: 'uniswapV3Api',
  baseQuery: dynamicBaseQuery, // Use dynamic base query here
  endpoints: (builder) => ({
    getUniswapV3PoolsByToken: builder.query<
      UniswapV3Pool[],
      {
        token0: string
        chainId: number // Added chainId here
      }
    >({
      query: ({ token0, chainId }) => ({
        chainId, // Pass chainId to the dynamic base query
        body: {
          document: getUniswapV3PoolsByToken,
          variables: {
            token0: token0.toLowerCase(),
          },
        },
      }),
      transformResponse: (res: { pools: UniswapV3Pool[] }) => {
        return res?.pools || []
      },
    }),
    getUniswapV3PoolsByTokensPair: builder.query<
      UniswapV3Pool[],
      {
        token0: string
        token1: string
        chainId: number // Added chainId here
      }
    >({
      query: ({ token0, token1, chainId }) => ({
        chainId, // Pass chainId to the dynamic base query
        body: {
          document: getUniswapV3PoolsByTokensPair,
          variables: {
            token0: token0.toLowerCase(),
            token1: token1.toLowerCase(),
          },
        },
      }),
      transformResponse: (res: { pools: UniswapV3Pool[] }) => {
        return res?.pools || []
      },
    }),
  }),
})
