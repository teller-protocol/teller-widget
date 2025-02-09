import { DEFAULT_CHAIN_ID, isSupportedChain, SupportedChainId } from 'constants/chains'

const UNISWAP_V3_GRAPH_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: import.meta.env.VITE_SUBGRAPH_UNISWAP_V3_MAINNET_URL,
  [SupportedChainId.POLYGON]: import.meta.env.VITE_SUBGRAPH_UNISWAP_V3_POLYGON_URL,
  [SupportedChainId.ARBITRUM]: `https://gateway.thegraph.com/api/${"helo"}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`,
  [SupportedChainId.BASE]: import.meta.env.VITE_SUBGRAPH_UNISWAP_V3_BASE_URL,
}
export const getSubgraphURL: (chainId?: number) => string = (
  chainId = DEFAULT_CHAIN_ID,
) => {
  console.log("subgraph: ",UNISWAP_V3_GRAPH_URL[chainId])
  if (!isSupportedChain(chainId)) return UNISWAP_V3_GRAPH_URL[DEFAULT_CHAIN_ID]
  return UNISWAP_V3_GRAPH_URL[chainId]
}
