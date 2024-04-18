import { useAccount, useChainId } from "wagmi";
import { useAlchemy } from "./useAlchemy";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { AppTokens } from "../components/Widget/Widget";
import { TokenBalance } from "@teller-protocol/alchemy-sdk";

export type UserToken = {
  address: string;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  balanceBigInt: BigInt;
  decimals: number;
};

export const useGetUserTokens = (tokens?: AppTokens) => {
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const alchemy = useAlchemy();
  const chainId = useChainId();

  let appChainTokens = tokens?.[chainId] ?? [];
  appChainTokens = appChainTokens.map((token) => token.toLowerCase());

  useEffect(() => {
    if (!alchemy || !address) return;

    void (async () => {
      const userTokensData: UserToken[] = [];

      const balances = await alchemy.core.getTokenBalances(address);
      const nonZeroBalances = balances.tokenBalances.filter(
        (token) => BigInt(token.tokenBalance ?? 0) !== BigInt(0)
      );

      const appTokensWithBalances = appChainTokens.map((appToken) => {
        const tokenBalanceFromUserIndex = nonZeroBalances.findIndex(
          (balance) => balance.contractAddress.toLowerCase() === appToken
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
      });

      const newArray = [...appTokensWithBalances, ...nonZeroBalances];
      await Promise.all(
        newArray.map(async (token) => {
          await alchemy.core
            .getTokenMetadata(token.contractAddress)
            .then((metadata) => {
              if (metadata.decimals === 0 || !metadata.logo) return;
              const balanceBigInt = BigInt(token?.tokenBalance ?? 0);
              const decimals = metadata.decimals ?? 0;

              userTokensData.push({
                address: token.contractAddress,
                name: metadata.name ?? "",
                symbol: metadata.symbol ?? "",
                logo: metadata.logo,
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
  }, [alchemy, address]);

  return { userTokens, isLoading };
};
