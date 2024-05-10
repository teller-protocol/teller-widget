import { useChainId, useChains } from "wagmi";

export const useChainData = () => {
  const chainId = useChainId();
  const chains = useChains();

  const chain = chains.find((c) => c.id === chainId);
  const chainExplorerURL = chain?.blockExplorers?.default.url;
  const chainName = chain?.name;

  return { chainExplorerURL, chainName };
};
