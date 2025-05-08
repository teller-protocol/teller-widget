import { Alchemy, TokenBalance } from "alchemy-sdk";
import { useEffect, useState } from "react";

import { WhitelistedTokens } from "../components/Widget/Widget";
import { ALCHEMY_API_KEY } from "../constants/global";

import { mapChainIdToAlchemyNetworkKey } from "./useAlchemy";
import { UserToken, runInChunks } from "./useGetUserTokens";

const chainAwareAlchemy = (chainId: number) => {
  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: mapChainIdToAlchemyNetworkKey[chainId],
  });
};

export const useFetchAllTokens = (whitelistedTokens?: WhitelistedTokens) => {
  const [tokens, setTokens] = useState<UserToken[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!whitelistedTokens) return;
      const allTokens: UserToken[] = [];

      await Promise.all(
        Object.keys(whitelistedTokens).map(async (chainId) => {
          const alchemy = chainAwareAlchemy(Number(chainId));
          const tokens = whitelistedTokens[chainId];

          await runInChunks<string, UserToken | null>(
            tokens,
            async (tokenAddress) => {
              const metadata = await alchemy.core.getTokenMetadata(
                tokenAddress
              );
              if (metadata.decimals === 0) return null;
              return {
                address: tokenAddress,
                name: metadata.name ?? "",
                symbol: metadata.symbol ?? "",
                logo: metadata.logo ?? "",
                balance: "0", // Default balance as 0 since it's not fetched here
                balanceBigInt: BigInt(0),
                decimals: metadata.decimals ?? 0,
                chainId: Number(chainId),
              };
            },
            40,
            250,
            (tokensChunk) => {
              allTokens.push(...tokensChunk.filter((token) => token !== null));
            }
          );
        })
      );

      setTokens(allTokens);
    };

    void fetchTokens();
  }, [whitelistedTokens]);

  return tokens;
};
