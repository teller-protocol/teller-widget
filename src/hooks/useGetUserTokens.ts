import {
  TokenBalance,
  TokenBalancesResponseErc20,
  TokenBalanceType,
  TokenMetadataResponse,
} from "alchemy-sdk";
import { useEffect, useState, useMemo } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

import { useGetTokenList } from "./queries/useGetTokenList";
import { useAlchemy } from "./useAlchemy";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";

export type UserToken = {
  address: Address;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  balanceBigInt: bigint;
  decimals: number;
  chainId?: number;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const runInChunks = async <T, X>(
  items: T[],
  handler: (item: T) => Promise<any>,
  chunkSize: number,
  delayMs: number,
  chunkCallback: (res: X[]) => void
) => {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkRes = await Promise.all<X>(chunk.map(handler));
    chunkCallback(chunkRes);

    if (i + chunkSize < items.length) {
      await sleep(delayMs);
    }
  }
};

export const useGetUserTokens = (
  whiteListedTokens?: string[],
  showOnlyWhiteListedTokens?: boolean,
  skip?: boolean
) => {
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const alchemy = useAlchemy();

  const getTokenImageAndSymbolFromTokenList =
    useGetTokenImageAndSymbolFromTokenList();
  const chainId = useChainId();
  const { data: tokenList } = useGetTokenList();

  useEffect(() => {
    if (
      !alchemy ||
      skip ||
      !tokenList[chainId] ||
      tokenList[chainId].length === 0
    ) {
      return;
    }

    void (async () => {
      let pageKey: string | undefined = undefined;
      const nonZeroBalances: TokenBalance[] = [];

      // Loop through token pages
      do {
        let balances: Omit<TokenBalancesResponseErc20, "address"> = {
          tokenBalances: [],
        };

        if (address) {
          try {
            balances = await alchemy.core.getTokenBalances(address, {
              pageKey, // Pass the pageKey for pagination
              type: TokenBalanceType.ERC20, // Specify the token type (ERC-20)
            });
          } catch (e) {
            await sleep(250);

            balances = await alchemy.core.getTokenBalances(address, {
              pageKey, // Pass the pageKey for pagination
              type: TokenBalanceType.ERC20, // Specify the token type (ERC-20)
            });
          }
        }

        const filteredBalances = balances.tokenBalances.filter(
          (token) => BigInt(token.tokenBalance ?? 0) !== BigInt(0)
        );
        nonZeroBalances.push(...filteredBalances);
        pageKey = balances.pageKey; // Update pageKey to fetch next page if available
      } while (pageKey);

      const whiteListedTokensWithBalances = whiteListedTokens?.map(
        (appToken) => {
          const tokenBalanceFromUserIndex = nonZeroBalances.findIndex(
            (balance) =>
              balance.contractAddress.toLowerCase() === appToken.toLowerCase()
          );
          if (tokenBalanceFromUserIndex >= 0) {
            const userBalance = nonZeroBalances[tokenBalanceFromUserIndex];
            nonZeroBalances.splice(tokenBalanceFromUserIndex, 1);
            return {
              ...userBalance,
              contractAddress: appToken,
            };
          } else {
            return {
              contractAddress: appToken,
              tokenBalance: BigInt(0),
            };
          }
        }
      );

      const metadataHandler = (
        token: TokenBalance,
        metadata: TokenMetadataResponse
      ): UserToken | null => {
        if (metadata.decimals === 0) return null;

        const imageAndSymbol = getTokenImageAndSymbolFromTokenList(
          token.contractAddress
        );

        const logo = metadata.logo ?? imageAndSymbol.image ?? "";
        const balanceBigInt = BigInt(token?.tokenBalance ?? 0);
        const decimals = metadata.decimals ?? 0;

        return {
          address: token.contractAddress as Address,
          name: metadata.name ?? "",
          symbol: imageAndSymbol.symbol ?? metadata.symbol ?? "",
          logo,
          balance: formatUnits(balanceBigInt, decimals),
          balanceBigInt,
          decimals,
        };
      };

      const userTokensWithWhitelistedTokens = [
        ...(whiteListedTokensWithBalances as TokenBalance[]),
        ...(showOnlyWhiteListedTokens ? [] : nonZeroBalances),
      ];

      let chunks: (UserToken | null)[][] = [];

      await runInChunks<TokenBalance, UserToken | null>(
        userTokensWithWhitelistedTokens,
        async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );
          return metadataHandler(token, metadata);
        },
        40,
        250,
        (tokensChunk) => {
          chunks = chunks.concat(tokensChunk);
        }
      );

      setUserTokens((userTokens) => [
        ...userTokens,
        ...chunks.flat().filter((token) => token !== null),
      ]);
      setIsLoading(false);
    })();
  }, [
    address,
    alchemy,
    getTokenImageAndSymbolFromTokenList,
    tokenList,
    chainId,
    showOnlyWhiteListedTokens,
    skip,
    whiteListedTokens,
  ]);

  const memoizedReturn = useMemo(
    () => ({ userTokens, isLoading }),
    [userTokens, isLoading]
  );
  return memoizedReturn;
};
