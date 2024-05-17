import { useEffect, useState } from "react";
import { useAlchemy } from "./useAlchemy";
import { TokenMetadataResponse } from "alchemy-sdk";

export const useGetTokenMetadata = (
  tokenAddress: string,
  onSuccess?: (url: string | null) => void
) => {
  const alchemy = useAlchemy();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadataResponse>();

  useEffect(() => {
    if (!alchemy || !tokenAddress) return;

    void (async () => {
      await alchemy.core.getTokenMetadata(tokenAddress).then((metadata) => {
        setTokenMetadata(metadata);
        onSuccess && metadata && onSuccess?.(metadata.logo);
        setIsLoading(false);
      });
    })();
  }, [alchemy, onSuccess, tokenAddress]);

  return { tokenMetadata, isLoading };
};
