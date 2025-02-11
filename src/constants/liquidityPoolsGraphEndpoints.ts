import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";

export const getLiquidityPoolsGraphEndpoint = (chainId: number) => {
  const LIQUIDITY_POOLS_GRAPH_ENDPOINTS: {
    [chainId: number]: string | undefined;
  } = {
    [mainnet.id]: `https://api.studio.thegraph.com/query/36377/tellerv2-lender-groups-mainnet/version/latest`,
    [polygon.id]: `https://api.studio.thegraph.com/query/36377/tellerv2-lender-groups-polygon/version/latest`,
    [arbitrum.id]: `https://api.studio.thegraph.com/query/36377/tellerv2-lender-groups-arbitrum/version/latest`,
    [base.id]: `https://api.studio.thegraph.com/query/36377/tellerv2-lender-groups-base/version/latest`,
  };

  return LIQUIDITY_POOLS_GRAPH_ENDPOINTS[chainId] ?? "";
};
