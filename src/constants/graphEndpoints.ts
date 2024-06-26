import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";

export const GRAPH_ENDPOINTS: { [chainId: number]: string | undefined } = {
  [mainnet.id]:
    "https://api.studio.thegraph.com/proxy/51204/tellerv2-mainnet/version/latest",
  [polygon.id]:
    "https://api.studio.thegraph.com/proxy/36377/tellerv2-polygon/version/latest",
  [arbitrum.id]:
    "https://api.studio.thegraph.com/proxy/51204/tellerv2-arbitrum/version/latest",
  [base.id]:
    "https://api.studio.thegraph.com/query/36377/tellerv2-base/version/latest",
};
