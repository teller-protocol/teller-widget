import { useChainId } from "wagmi";
import { GRAPH_ENDPOINTS } from "../constants/graphEndpoints";

export const useGraphURL = () => {
  const chainId = useChainId();

  return GRAPH_ENDPOINTS[chainId] ?? "";
};
