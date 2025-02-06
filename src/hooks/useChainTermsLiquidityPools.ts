import { useMemo } from "react";
import { useChainId } from "wagmi";
import { ChainTerms } from "../helpers/termsListLiquidityPools";
import { chainToTerms } from "../helpers/termsListLiquidityPools";

export const useChainTermsLiquidityPools = (): ChainTerms | undefined => {
  const chainId = useChainId();
  return useMemo(() => {
    if (!chainId) return;
    return chainToTerms[chainId];
  }, [chainId]);
};
