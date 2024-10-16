import { useAccount, useChainId } from "wagmi";
import { useAlchemy } from "./useAlchemy";
import { useEffect, useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import { WhitelistedTokens } from "../components/Widget/Widget";
import { useGetTokenList } from "./queries/useGetTokenList";
import { useGetTokenImageFromTokenList } from "./useGetTokenImageFromTokenList";

export type UserToken = {
  address: Address;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  balanceBigInt: bigint;
  decimals: number;
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

  const getTokenImageFromTokenList = useGetTokenImageFromTokenList();

  useEffect(() => {
    if (!alchemy || skip) return;

    void (async () => {
      const userTokensData: UserToken[] = [];

      const balances = address
        ? await alchemy.core.getTokenBalances(address)
        : { tokenBalances: [] };
      const nonZeroBalances = balances.tokenBalances.filter(
        (token) => BigInt(token.tokenBalance ?? 0) !== BigInt(0)
      );

      const whiteListedTokensWithBalances = whiteListedTokens?.map(
        (appToken) => {
          const tokenBalanceFromUserIndex = nonZeroBalances.findIndex(
            (balance) =>
              balance.contractAddress.toLowerCase() === appToken.toLowerCase()
          );
          if (tokenBalanceFromUserIndex > 0) {
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

      const userTokensWithWhitelistedTokens = [
        ...(whiteListedTokensWithBalances as any[]),
        ...(showOnlyWhiteListedTokens ? [] : nonZeroBalances),
      ];
      await Promise.all(
        userTokensWithWhitelistedTokens.map(async (token) => {
          await alchemy.core
            .getTokenMetadata(token.contractAddress)
            .then((metadata) => {
              if (metadata.decimals === 0) return;
              const logo =
                metadata.logo ??
                getTokenImageFromTokenList(token.contractAddress) ??
                "";
              const balanceBigInt = BigInt(token?.tokenBalance ?? 0);
              const decimals = metadata.decimals ?? 0;

              userTokensData.push({
                address: token.contractAddress,
                name: metadata.name ?? "",
                symbol: metadata.symbol ?? "",
                logo,
                balance: formatUnits(balanceBigInt, decimals),
                balanceBigInt,
                decimals,
              });
            });
        })
      );
      setIsLoading(false);
      setUserTokens(userTokensData);
    })();
  }, [
    address,
    alchemy,
    getTokenImageFromTokenList,
    showOnlyWhiteListedTokens,
    skip,
    whiteListedTokens,
  ]);

  return { userTokens, isLoading };
};
