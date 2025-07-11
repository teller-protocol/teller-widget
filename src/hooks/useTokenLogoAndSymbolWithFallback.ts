import { useMemo } from "react";

import defaultTokenImage from "../assets/generic_token-icon.svg";

import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";
import { UserToken } from "./useGetUserTokens";

export const useTokenLogoAndSymbolWithFallback = (token: UserToken) => {
  const { getTokenImageAndSymbolFromTokenList, isTokenListLoading } =
    useGetTokenImageAndSymbolFromTokenList();

  const data = useMemo(() => {
    if (token.logo && token.symbol && token.chainId) {
      return {
        logo: token.logo,
        symbol: token.symbol,
        chainId: token.chainId,
      };
    }

    if (isTokenListLoading) return null;

    const fetched = getTokenImageAndSymbolFromTokenList(
      token.address,
      token.chainId
    );

    return {
      logo: fetched?.image || defaultTokenImage,
      symbol: token.symbol || fetched?.symbol || "",
      chainId: token.chainId || fetched?.chainId,
    };
  }, [token, getTokenImageAndSymbolFromTokenList, isTokenListLoading]);

  return data;
};
