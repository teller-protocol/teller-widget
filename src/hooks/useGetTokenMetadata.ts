import { useEffect, useState } from "react";
import { useAlchemy } from "./useAlchemy";
import { TokenMetadataResponse } from "@teller-protocol/alchemy-sdk";

export const useGetTokenMetadata = (tokenAddress: string) => {
  const alchemy = useAlchemy();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadataResponse>();

  useEffect(() => {
    if (!alchemy || !tokenAddress) return;

    void (async () => {
      await alchemy.core.getTokenMetadata(tokenAddress).then((metadata) => {
        setTokenMetadata(metadata);
        setIsLoading(false);
      });
    })();
  }, [alchemy, tokenAddress]);

  return { tokenMetadata, isLoading };
};
