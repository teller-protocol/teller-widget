import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";

export const getGraphEndpointWithKey = (apiKey: string, chainId: number) => {
  const GRAPH_ENDPOINTS: { [chainId: number]: string | undefined } = {
    [mainnet.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/B6FW3z7yLTJKVuqz6kLDJAwJru1T89j4ww5JfY3GYX8F`,
    [polygon.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/8bjHtQZ9PZUMQAbCGJw5Zx2SbZZY2LQz8WH3rURzN5do`,
    [arbitrum.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/F2Cgx4q4ATiopuZ13nr1EMKmZXwfAdevF3EujqfayK7a`,
    [base.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/ArZjkaosc5rmBoYqprFWomvnjKSFMGkPFD7yuaZGuqQo`,
  };

  return GRAPH_ENDPOINTS[chainId];
};

export const getUniswapV3GraphEndpointWithKey = (
  apiKey: string,
  chainId: number
) => {
  const GRAPH_ENDPOINTS: { [chainId: number]: string | undefined } = {
    [mainnet.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`,
    [polygon.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm`,
    [arbitrum.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`,
    [base.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG

`,
  };

  return GRAPH_ENDPOINTS[chainId];
};
