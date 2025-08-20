import { arbitrum, base, mainnet, polygon } from "viem/chains";

export const getLiquidityPoolsGraphEndpoint = (
  chainId: number,
  isV2?: boolean
) => {
  const LIQUIDITY_POOLS_GRAPH_ENDPOINTS_V1: {
    [chainId: number]: string | undefined;
  } = {
    [mainnet.id]: `https://hasura-mainnet.nfteller.org/v1/graphql`,
    [polygon.id]: `https://hasura-polygon.nfteller.org/v1/graphql`,
    [arbitrum.id]: `https://hasura-arbitrum.nfteller.org/v1/graphql`,
    [base.id]: `https://hasura-base.nfteller.org/v1/graphql`,
  };

  const LIQUIDITY_POOLS_GRAPH_ENDPOINTS_V2: {
    [chainId: number]: string | undefined;
  } = {
    [mainnet.id]: `https://hasura-v2-mainnet.nfteller.org/v1/graphql`,
    [polygon.id]: `https://hasura-v2-polygon.nfteller.org/v1/graphql`,
    [arbitrum.id]: `https://hasura-v2-arbitrum.nfteller.org/v1/graphql`,
    [base.id]: `https://hasura-v2-base.nfteller.org/v1/graphql`,
  };

  if (isV2) return LIQUIDITY_POOLS_GRAPH_ENDPOINTS_V2[chainId] ?? "";

  return LIQUIDITY_POOLS_GRAPH_ENDPOINTS_V1[chainId] ?? "";
};
