import { useQuery } from "@tanstack/react-query";
import { GraphQLClient } from "graphql-request";

import { UniswapV3Pool } from "../../constants/uniswapV3Pool.type";

import {
  getEthPriceUSD,
  getTokenDerivedETH,
  getUniswapV3PoolsByToken,
  getUniswapV3PoolsByTokensPair,
} from "./uniswapV3ApiQueries";
import { getSubgraphURL } from "./uniswapV3Config";

export const getUniswapV3Client = (subgraphApiKey: string, chainId: number) => {
  const url = getSubgraphURL(subgraphApiKey, chainId);
  return new GraphQLClient(url);
};

export const fetchUniswapV3PoolsByToken = async ({
  subgraphApiKey,
  token0,
  chainId,
}: {
  subgraphApiKey: string;
  token0: string;
  chainId: number;
}): Promise<UniswapV3Pool[]> => {
  const client = getUniswapV3Client(subgraphApiKey, chainId);
  const res: { pools: UniswapV3Pool[] } = await client.request(
    getUniswapV3PoolsByToken,
    { token0: token0.toLowerCase() }
  );
  return res?.pools ?? [];
};

export const fetchUniswapV3PoolsByTokensPair = async ({
  subgraphApiKey,
  token0,
  token1,
  chainId,
}: {
  subgraphApiKey: string;
  token0: string;
  token1: string;
  chainId: number;
}): Promise<UniswapV3Pool[]> => {
  const client = getUniswapV3Client(subgraphApiKey, chainId);
  const res: { pools: UniswapV3Pool[] } = await client.request(
    getUniswapV3PoolsByTokensPair,
    {
      token0: token0.toLowerCase(),
      token1: token1.toLowerCase(),
    }
  );
  return res?.pools ?? [];
};

export const fetchTokenDerivedETH = async ({
  subgraphApiKey,
  tokenId,
  chainId,
}: {
  subgraphApiKey: string;
  tokenId: string;
  chainId: number;
}): Promise<{ derivedETH: string }> => {
  const client = getUniswapV3Client(subgraphApiKey, chainId);
  const res: { token: { derivedETH: string } } = await client.request(
    getTokenDerivedETH,
    { tokenId }
  );
  return res.token;
};

export const fetchEthPriceUSD = async ({
  subgraphApiKey,
  chainId,
}: {
  subgraphApiKey: string;
  chainId: number;
}): Promise<{ ethPriceUSD: string }> => {
  const client = getUniswapV3Client(subgraphApiKey, chainId);
  const res: { bundle: { ethPriceUSD: string } } = await client.request(
    getEthPriceUSD,
    {}
  );
  return res.bundle;
};

export const useUniswapV3PoolsByToken = ({
  subgraphApiKey,
  token0,
  chainId,
}: {
  subgraphApiKey: string;
  token0: string;
  chainId: number;
}) => {
  return useQuery({
    queryKey: ["uniswapV3PoolsByToken", chainId, token0],
    queryFn: () =>
      fetchUniswapV3PoolsByToken({ subgraphApiKey, token0, chainId }),
  });
};

export const useUniswapV3PoolsByTokensPair = ({
  subgraphApiKey,
  token0,
  token1,
  chainId,
}: {
  subgraphApiKey: string;
  token0: string;
  token1: string;
  chainId: number;
}) => {
  return useQuery({
    queryKey: ["uniswapV3PoolsByTokensPair", chainId, token0, token1],
    queryFn: () =>
      fetchUniswapV3PoolsByTokensPair({
        subgraphApiKey,
        token0,
        token1,
        chainId,
      }),
  });
};

export const useTokenDerivedETH = ({
  subgraphApiKey,
  tokenId,
  chainId,
}: {
  subgraphApiKey: string;
  tokenId: string;
  chainId: number;
}) => {
  return useQuery({
    queryKey: ["tokenDerivedETH", chainId, tokenId],
    queryFn: () =>
      fetchTokenDerivedETH({
        subgraphApiKey,
        tokenId,
        chainId,
      }),
  });
};

export const useEthPriceUSD = ({
  subgraphApiKey,
  chainId,
}: {
  subgraphApiKey: string;
  chainId: number;
}) => {
  return useQuery({
    queryKey: ["ethPriceUSD", chainId],
    queryFn: () =>
      fetchEthPriceUSD({
        subgraphApiKey,
        chainId,
      }),
  });
};
