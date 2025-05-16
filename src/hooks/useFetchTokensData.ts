import { Alchemy } from "alchemy-sdk";
import { ALCHEMY_API_KEY } from "../constants/global";
import { mapChainIdToAlchemyNetworkKey } from "./useAlchemy";
import { UserToken, runInChunks } from "./useGetUserTokens";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";

const chainAwareAlchemy = (chainId: number) => {
  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: mapChainIdToAlchemyNetworkKey[chainId],
  });
};

export const useGetAllWhitelistedTokensData = () => {
  const getTokenImageAndSymbolFromTokenList =
    useGetTokenImageAndSymbolFromTokenList();
  const fetchAllWhitelistedTokensData = async (
    whitelistedTokens: string[],
    chainId: number
  ): Promise<UserToken[]> => {
    if (!whitelistedTokens) return [];
    const allTokens: UserToken[] = [];
    const alchemy = chainAwareAlchemy(chainId);

    await runInChunks<string, UserToken | null>(
      whitelistedTokens,
      async (tokenAddress) => {
        const metadata = await alchemy.core.getTokenMetadata(tokenAddress);
        const imageAndSymbol = getTokenImageAndSymbolFromTokenList(
          tokenAddress,
          chainId
        );

        if (metadata.decimals === 0) return null;
        return {
          address: tokenAddress,
          name: metadata.name ?? "",
          symbol: metadata.symbol ?? "",
          logo: metadata.logo ?? imageAndSymbol.image ?? "",
          balance: "0", // Default balance as 0 since it's not fetched here
          balanceBigInt: BigInt(0),
          decimals: metadata.decimals ?? 0,
          chainId: Number(chainId),
        };
      },
      40,
      250,
      (tokensChunk) => {
        allTokens.push(
          ...tokensChunk.filter((token): token is UserToken => token !== null)
        );
      }
    );

    return allTokens;
  };
  return { fetchAllWhitelistedTokensData };
};
