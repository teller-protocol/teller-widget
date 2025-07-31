import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";

export const getLiquidityPoolsGraphEndpoint = (chainId: number) => {
  const LIQUIDITY_POOLS_GRAPH_ENDPOINTS: {
    [chainId: number]: string | undefined;
  } = {
    [mainnet.id]: `https://hasura-mainnet.nfteller.org/v1/graphql`,
    [polygon.id]: `https://hasura-polygon.nfteller.org/v1/graphql`,
    [arbitrum.id]: `https://hasura-arbitrum.nfteller.org/v1/graphql`,
    [base.id]: `https://hasura-base.nfteller.org/v1/graphql`,
    [optimism.id]: `https://hasura-v2-optimism.nfteller.org/v1/graphql`,
  };

  return LIQUIDITY_POOLS_GRAPH_ENDPOINTS[chainId] ?? "";
};
