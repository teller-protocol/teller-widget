import { useChainId } from "wagmi";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { getUniswapV3GraphEndpointWithKey } from "../../constants/graphEndpoints";


export const getSubgraphURL: (chainId?: number) => string = () => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();

  return getUniswapV3GraphEndpointWithKey(subgraphApiKey, chainId) ?? "";
}
