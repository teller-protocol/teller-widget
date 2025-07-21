import { Alchemy } from "alchemy-sdk";
import { ALCHEMY_API_KEY } from "../constants/global";
import { mapChainIdToAlchemyNetworkKey } from "./useAlchemy";
import { UserToken, runInChunks } from "./useGetUserTokens";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";
import { useGetTokenList } from "./queries/useGetTokenList";
import { HARRY_POTTER_OBAMA_SONIC_10_INU_ADDRESSES } from "../constants/tokens";

const chainAwareAlchemy = (chainId: number) => {
  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: mapChainIdToAlchemyNetworkKey[chainId],
  });
};

export const useGetTokensData = () => {
  const { getTokenImageAndSymbolFromTokenList } =
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
        if (metadata.decimals === 0) return null;
        const imageAndSymbol = getTokenImageAndSymbolFromTokenList(
          tokenAddress,
          chainId
        );

        const isHPOS10I = HARRY_POTTER_OBAMA_SONIC_10_INU_ADDRESSES.includes(
          tokenAddress.toLowerCase()
        );

        return {
          address: tokenAddress,
          name: metadata.name ?? "",
          symbol: isHPOS10I
            ? "HPOS10I"
            : imageAndSymbol?.symbol ?? metadata.symbol ?? "",
          logo: metadata.logo ?? imageAndSymbol?.image ?? "",
          balance: "0", // Default balance as 0 since it's not fetched here
          balanceBigInt: "0",
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
