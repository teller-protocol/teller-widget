import { useCallback } from "react";
import { useChainId } from "wagmi";

import { useGetTokenList } from "./queries/useGetTokenList";

export const useGetTokenImageAndSymbolFromTokenList = () => {
  const { data: tokenList } = useGetTokenList();
  const _chainId = useChainId();

  const getTokenImageAndSymbolFromTokenList = useCallback(
    (tokenAddress: string, chainId?: number) => {
      const token = tokenList[chainId ?? _chainId]?.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      return {
        image: token?.logoURI,
        symbol: token?.symbol,
      };
    },
    [_chainId, tokenList]
  );

  return getTokenImageAndSymbolFromTokenList;
};
