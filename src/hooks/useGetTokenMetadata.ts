import { useEffect, useState } from "react";
import { useAlchemy } from "./useAlchemy";
import { TokenMetadataResponse } from "alchemy-sdk";
import { useGetTokenImageFromTokenList } from "./useGetTokenImageFromTokenList";
import generic_token from "../assets/generic_token-icon.svg";

export const useGetTokenMetadata = (
  tokenAddress: string,
  onSuccess?: (url: string | null) => void
) => {
  const alchemy = useAlchemy();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadataResponse>();

  const getTokenImageFromTokenList = useGetTokenImageFromTokenList();

  useEffect(() => {
    if (!alchemy || !tokenAddress) return;

    void (async () => {
      await alchemy.core.getTokenMetadata(tokenAddress).then((metadata) => {
        const logo =
          metadata?.logo ??
          getTokenImageFromTokenList(tokenAddress) ??
          generic_token;
        setTokenMetadata({ ...metadata, logo });
        onSuccess && metadata && onSuccess?.(metadata.logo);
        setIsLoading(false);
      });
    })();
  }, [alchemy, getTokenImageFromTokenList, onSuccess, tokenAddress]);

  return { tokenMetadata, isLoading };
};
