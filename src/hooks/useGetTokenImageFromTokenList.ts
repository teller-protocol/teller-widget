import { useChainId } from "wagmi";
import { useGetTokenList } from "./queries/useGetTokenList";
import { useCallback } from "react";

export const useGetTokenImageFromTokenList = () => {
  const { data: tokenList } = useGetTokenList();
  const chainId = useChainId();

  const getTokenImageFromTokenList = useCallback(
    (tokenAddress: string) => {
      return tokenList[chainId]?.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )?.logoURI;
    },
    [chainId, tokenList]
  );

  return getTokenImageFromTokenList;
};
