import { useCallback } from "react";
import { useChainId } from "wagmi";

import { useGetTokenList } from "./queries/useGetTokenList";

export const useGetTokenImageAndSymbolFromTokenList = () => {
  const { data: tokenList } = useGetTokenList();
  const chainId = useChainId();

  const getTokenImageAndSymbolFromTokenList = useCallback(
    (tokenAddress: string) => {
      const token = tokenList[chainId]?.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      return {
        image: token?.logoURI,
        symbol: token?.symbol,
      };
    },
    [chainId, tokenList]
  );

  return {
    getTokenImageAndSymbolFromTokenList,
    tokenList: tokenList[chainId] || [],
  };
};
