import { useAccount } from "wagmi";
import { useAlchemy } from "./useAlchemy";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";

export type UserToken = {
  address: string;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  balanceBigInt: BigInt;
  decimals: number;
};

export const useGetUserTokens = () => {
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const alchemy = useAlchemy();
  useEffect(() => {
    if (!alchemy || !address) return;

    void (async () => {
      const userTokensData: UserToken[] = [];
      const balances = await alchemy.core.getTokenBalances(address);
      const nonZeroBalances = balances.tokenBalances.filter(
        (token) => BigInt(token.tokenBalance ?? 0) !== BigInt(0)
      );

      await Promise.all(
        nonZeroBalances.map(async (token) => {
          await alchemy.core
            .getTokenMetadata(token.contractAddress)
            .then((metadata) => {
              if (metadata.decimals === 0 || !metadata.logo) return;
              const balanceBigInt = BigInt(token.tokenBalance ?? 0);
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
