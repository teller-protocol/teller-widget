import { useEffect, useState } from "react";
import { useAlchemy } from "./useAlchemy";
import { TokenMetadataResponse } from "alchemy-sdk";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";
import generic_token from "../assets/generic_token-icon.svg";
import { UniswapToken } from "./queries/useGetTokenList";

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
  tokenList: Record<number, UniswapToken[]>,
  currentChainId: number
) => {
  let token = tokenList?.[currentChainId]?.find(
    (t) => t.address.toLowerCase() === address
  );

  if (!token) {
    token = tokenList?.[currentChainId]?.find(
      (t) => t.symbol.toLowerCase() === metadata.symbol?.toLowerCase()
    );

    if (!token) {
      const chains = Object.keys(tokenList || {});
      for (const chain of chains) {
        const foundToken = tokenList?.[parseInt(chain)]?.find(
          (t) => t.address.toLowerCase() === address
        );
        if (foundToken) {
          token = foundToken;
          break;
        }
      }
    }
  }

  return {
    address: token?.address || address,
    name: token?.name || metadata.name || "",
    symbol: token?.symbol || metadata.symbol || "",
    logo: token?.logoURI || metadata.logo || "",
    decimals: token?.decimals || metadata.decimals || 18,
    chainId: token?.chainId || currentChainId,
  };
};