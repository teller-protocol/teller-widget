import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";

export const getGraphEndpointWithKey = (apiKey: string, chainId: number) => {
  const GRAPH_ENDPOINTS: { [chainId: number]: string | undefined } = {
    [mainnet.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/B6FW3z7yLTJKVuqz6kLDJAwJru1T89j4ww5JfY3GYX8F`,
    [polygon.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/8bjHtQZ9PZUMQAbCGJw5Zx2SbZZY2LQz8WH3rURzN5do`,
    [arbitrum.id]: `https://api.studio.thegraph.com/query/51204/tellerv2-arbitrum/v0.4.21-16`,
    [base.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/ArZjkaosc5rmBoYqprFWomvnjKSFMGkPFD7yuaZGuqQo`,
  };

  return GRAPH_ENDPOINTS[chainId];
};
