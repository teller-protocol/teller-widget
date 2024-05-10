import { useMemo } from "react";
import { useChainId } from "wagmi";
import { ChainTerms, chainToTerms } from "../helpers/termsList";

export const useChainTerms = (): ChainTerms | undefined => {
  const chainId = useChainId();
  return useMemo(() => {
    if (!chainId) return;
    return chainToTerms[chainId];
  }, [chainId]);
};
