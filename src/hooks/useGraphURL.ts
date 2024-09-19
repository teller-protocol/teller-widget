import { useChainId } from "wagmi";

import { getGraphEndpointWithKey } from "../constants/graphEndpoints";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";

export const useGraphURL = () => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();
  return getGraphEndpointWithKey(subgraphApiKey, chainId);
};
