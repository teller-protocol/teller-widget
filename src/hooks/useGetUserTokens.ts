import {
  type TokenBalance,
  type TokenBalancesResponseErc20,
  TokenBalanceType,
  type TokenMetadataResponse,
} from "alchemy-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useBlockNumber, useChainId } from "wagmi";

import { useGetTokenList } from "./queries/useGetTokenList";
import { useAlchemy } from "./useAlchemy";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";

export type UserToken = {
  address: Address;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  balanceBigInt: string;
  decimals: number;
  chainId?: number;
  rewardPercent?: number;
  rewardData?: any;
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
  const [lastFetchedBlock, setLastFetchedBlock] = useState<bigint | null>(null);
  const { address } = useAccount();
  const alchemy = useAlchemy();
  const fetchInProgressRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getTokenImageAndSymbolFromTokenList } =
    useGetTokenImageAndSymbolFromTokenList();
  const chainId = useChainId();
  const { data: tokenList } = useGetTokenList();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const fetchUserTokens = useCallback(
    async (force = false) => {
      if (
        !alchemy ||
        skip ||
        !chainId ||
        !tokenList ||
        !tokenList?.[chainId] ||
        tokenList?.[chainId].length === 0 ||
        !address
      ) {
        return;
      }

      // Prevent multiple simultaneous fetches unless forced
      if (fetchInProgressRef.current && !force) {
        return;
      }

      fetchInProgressRef.current = true;
      setIsLoading(true);

      try {
        let pageKey: string | undefined;
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

          const logo = metadata.logo ?? imageAndSymbol?.image ?? "";
          const balanceBigInt = BigInt(token?.tokenBalance ?? 0);
          const decimals = metadata.decimals ?? 0;

          return {
            address: token.contractAddress as Address,
            name: metadata.name ?? "",
            symbol: imageAndSymbol?.symbol ?? metadata.symbol ?? "",
            logo,
            balance: formatUnits(balanceBigInt, decimals),
            balanceBigInt: balanceBigInt.toString(),
            decimals,
            chainId,
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

        setUserTokens(chunks.flat().filter((token) => token !== null));
      } catch (error) {
        console.error("Error fetching user tokens:", error);
      } finally {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    },
    [
      address,
      alchemy,
      getTokenImageAndSymbolFromTokenList,
      tokenList,
      chainId,
      showOnlyWhiteListedTokens,
      skip,
      whiteListedTokens,
    ]
  );

  // Clear tokens when chain changes
  useEffect(() => {
    setUserTokens([]);
    setIsLoading(true);
    setLastFetchedBlock(null);
    fetchInProgressRef.current = false;

    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, [chainId]);

  // Debounced fetch to prevent multiple rapid calls
  const debouncedFetch = useCallback(
    (force = false) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchUserTokens(force)
          .then(() => {
            // Set initial block number after first fetch
            if (blockNumber) {
              setLastFetchedBlock(blockNumber);
            }
          })
          .catch(console.error);
      }, 100); // 100ms debounce
    },
    [fetchUserTokens, blockNumber]
  );

  // Initial fetch
  useEffect(() => {
    if (!blockNumber && !lastFetchedBlock) {
      debouncedFetch(true); // Force initial fetch
    }
  }, [debouncedFetch, blockNumber, lastFetchedBlock]);

  // Refetch when block number changes
  useEffect(() => {
    if (
      blockNumber &&
      lastFetchedBlock &&
      blockNumber > lastFetchedBlock + 10n // Refetch every 10 blocks to reduce frequency
    ) {
      setLastFetchedBlock(blockNumber);
      debouncedFetch(false); // Don't force block-based fetches
    }
  }, [blockNumber, lastFetchedBlock, debouncedFetch]);

  const memoizedReturn = useMemo(
    () => ({ userTokens, isLoading, refetch: () => fetchUserTokens(true) }),
    [userTokens, isLoading, fetchUserTokens]
  );
  return memoizedReturn;
};
