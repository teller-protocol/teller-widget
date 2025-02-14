import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { supportedPrincipalTokens, TOKEN_ADDRESSES } from "../constants/tokens";
import { useGetLiquidityPools } from "./queries/useGetLiquidityPools";
import { useAlchemy } from "./useAlchemy";
import { useConvertLenderGroupCommitmentToCommitment } from "./useConvertLenderGroupCommitmentToCommitment";
import { UserToken } from "./useGetUserTokens";

export const useGetCommitmentsForErc20Tokens = () => {
  const chainId = useChainId();
  const { convertCommitment } = useConvertLenderGroupCommitmentToCommitment();

  const { liquidityPools: liquidityPools, isLoading: liquidityPoolsLoading } =
    useGetLiquidityPools();

  const alchemy = useAlchemy();

  const [isLoading, setIsLoading] = useState<boolean>(
    liquidityPoolsLoading || true
  );

  const [principalErc20Tokens, setPrincipalErc20Tokens] = useState<UserToken[]>(
    []
  );

  const chainTokenAddresses = supportedPrincipalTokens
    .map((token: string) => TOKEN_ADDRESSES[chainId]?.[token])
    .filter((token: string) => typeof token === "string");

  useEffect(() => {
    if (liquidityPoolsLoading) {
      return;
    }

    (async () => {
      if (!Array.isArray(liquidityPools) || liquidityPools.length === 0) {
        console.warn("No liquidity pools available for filtering");
        return [];
      }

      const filteredPools = liquidityPools.filter(
        (pool) =>
          !chainTokenAddresses.includes(
            pool.principal_token_address?.toLowerCase()
          )
      );

      const convertedCommitments = await Promise.all(
        filteredPools.map(convertCommitment)
      );
      return convertedCommitments;
    })()
      .then(async (convertedCommitments) => {
        const tokenCommitmentMap = convertedCommitments
          .filter((commitment) => commitment?.principalToken?.address)
          .reduce((acc, commitment) => {
            const address = commitment?.principalToken.address.toLowerCase();
            const currentAmount = acc.get(address ?? "") || BigInt(0);
            const committedAmount = commitment?.committedAmount
              ? BigInt(commitment.committedAmount.toString())
              : BigInt(0);
            acc.set(address ?? "", currentAmount + committedAmount);
            return acc;
          }, new Map<string, bigint>());

        const uniqueAddresses = [...tokenCommitmentMap.keys()];

        const tokensWithMetadata = await Promise.all(
          uniqueAddresses.map(async (address) => {
            try {
              const metadata = await alchemy.core.getTokenMetadata(address);
              const aggregatedBalance = formatUnits(
                tokenCommitmentMap.get(address) || BigInt(0),
                metadata.decimals || 18
              );
              return {
                address: address as `0x${string}`,
                name: metadata.name || "",
                symbol: metadata.symbol || "",
                logo: metadata.logo || "",
                balance: aggregatedBalance || "0",
                balanceBigInt: tokenCommitmentMap.get(address) || BigInt(0),
                decimals: metadata.decimals || 18,
              } as UserToken;
            } catch (error) {
              console.error(
                `Error fetching metadata for token ${address}:`,
                error
              );
              return null;
            }
          })
        );

        setPrincipalErc20Tokens(
          tokensWithMetadata.filter(
            (token): token is UserToken => token !== null
          )
        );
      })
      .finally(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching commitments for ERC20 tokens", error);
        setIsLoading(false);
      });
  }, [
    liquidityPools,
    chainTokenAddresses,
    convertCommitment,
    liquidityPoolsLoading,
    alchemy?.core,
  ]);

  return {
    principalErc20Tokens,
    isLoading,
  };
};
