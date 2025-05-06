import { useChainId } from "wagmi";
import { useGetTokenList } from "./queries/useGetTokenList";
import { useCallback } from "react";

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

  return getTokenImageAndSymbolFromTokenList;
};
