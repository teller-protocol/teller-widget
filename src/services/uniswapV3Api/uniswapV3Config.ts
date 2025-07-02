import { DEFAULT_CHAIN_ID, isSupportedChain } from "../../constants/chains";
import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";

export const getSubgraphURL: (
  subgraphApiKey: string,
  chainId?: number
) => string = (subgraphApiKey, chainId = DEFAULT_CHAIN_ID) => {
  if (!isSupportedChain(chainId))
    return (
      getUniswapV3GraphEndpointWithKey(subgraphApiKey, DEFAULT_CHAIN_ID) || ""
    );
  return getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId) || "";
};
