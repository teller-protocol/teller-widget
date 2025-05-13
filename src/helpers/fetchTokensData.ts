import { Alchemy } from "alchemy-sdk";
import { WhitelistedTokens } from "../components/Widget/Widget";
import { ALCHEMY_API_KEY } from "../constants/global";
import { mapChainIdToAlchemyNetworkKey } from "../hooks/useAlchemy";
import { UserToken, runInChunks } from "../hooks/useGetUserTokens";

const chainAwareAlchemy = (chainId: number) => {
  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: mapChainIdToAlchemyNetworkKey[chainId],
  });
};

export const fetchAllWhitelistedTokensData = async (
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
      return {
        address: tokenAddress,
        name: metadata.name ?? "",
        symbol: metadata.symbol ?? "",
        logo: metadata.logo ?? "",
        balance: "1", // Default balance as 0 since it's not fetched here
        balanceBigInt: BigInt(1),
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
