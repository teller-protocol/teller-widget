import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";

export const getGraphEndpointWithKey = (apiKey: string, chainId: number) => {
  const GRAPH_ENDPOINTS: { [chainId: number]: string | undefined } = {
    [mainnet.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/4JruhWH1ZdwvUuMg2xCmtnZQYYHvmEq6cmTcZkpM6pW`,
    [polygon.id]: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/8bjHtQZ9PZUMQAbCGJw5Zx2SbZZY2LQz8WH3rURzN5do`,
    [arbitrum.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/F2Cgx4q4ATiopuZ13nr1EMKmZXwfAdevF3EujqfayK7a`,
    [base.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/8nZqHepMdWCy6CMV9gd4wBTawtxfku4kT8X4pBpa5r75`,
    [optimism.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/EWqjnhnW4wpcvBA61SdTvxu5VLnt9GT3HLz8zWKPxvVW`,
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
    [base.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG`,
    [optimism.id]: `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/Cghf4LfVqPiFw6fp6Y5X5Ubc8UpmUhSfJL82zwiBFLaj`,
  };

  return GRAPH_ENDPOINTS[chainId];
};
