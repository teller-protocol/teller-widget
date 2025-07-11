import { useCallback } from "react";
import { useChainId } from "wagmi";

import { useGetTokenList } from "./queries/useGetTokenList";

export const useGetTokenImageAndSymbolFromTokenList = () => {
  const { data: tokenList, isLoading } = useGetTokenList();
  const chainId = useChainId();

  const getTokenImageAndSymbolFromTokenList = useCallback(
    (tokenAddress: string, overrideChainId?: number) => {
      if (!tokenList || isLoading) return undefined;

      const tokens = tokenList[overrideChainId ?? chainId];
      if (!tokens) return undefined;

      const token = tokens.find(
        (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
      );

      if (!token) return undefined;

      return {
        image: token.logoURI,
        symbol: token.symbol,
      };
    },
    [tokenList, isLoading, chainId]
  );

  return {
    getTokenImageAndSymbolFromTokenList,
    isTokenListLoading: isLoading,
  };
};
