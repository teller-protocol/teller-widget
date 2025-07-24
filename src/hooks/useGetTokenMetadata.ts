import { TokenMetadataResponse } from "alchemy-sdk";
import { useEffect, useState } from "react";

import generic_token from "../assets/generic_token-icon.svg";

import { UniswapToken } from "./queries/useGetTokenList";
import { useAlchemy } from "./useAlchemy";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";

export const useGetTokenMetadata = (
  tokenAddress: string,
  onSuccess?: (url: string | null) => void
) => {
  const alchemy = useAlchemy();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadataResponse>();

  const { getTokenImageAndSymbolFromTokenList } =
    useGetTokenImageAndSymbolFromTokenList();

  useEffect(() => {
    if (!alchemy || !tokenAddress) return;

    void (async () => {
      await alchemy.core.getTokenMetadata(tokenAddress).then((metadata) => {
        const logo =
          metadata?.logo ??
          getTokenImageAndSymbolFromTokenList(tokenAddress)?.image ??
          generic_token;
        setTokenMetadata({ ...metadata, logo });
        onSuccess && metadata && onSuccess?.(metadata.logo);
        setIsLoading(false);
      });
    })();
  }, [alchemy, getTokenImageAndSymbolFromTokenList, onSuccess, tokenAddress]);

  return { tokenMetadata, isLoading };
};

export const findTokenWithMetadata = (
  address: string,
  metadata: TokenMetadataResponse,
  tokenList: Record<number, UniswapToken[]>
) => {
  let token: UniswapToken | null = null;
  for (const [_chainId, tokens] of Object.entries(tokenList)) {
    if (token) break;

    token =
      tokens.find((t) => t.address.toLowerCase() === address.toLowerCase()) ||
      null;
  }

  return {
    address: token?.address || address,
    name: token?.name || metadata.name || "",
    symbol: token?.symbol || metadata.symbol || "",
    logo: token?.logoURI || metadata.logo || "",
    decimals: token?.decimals || metadata.decimals || 18,
    chainId: token?.chainId || 1,
  };
};
