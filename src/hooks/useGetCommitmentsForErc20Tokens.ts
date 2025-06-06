import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { supportedPrincipalTokens, TOKEN_ADDRESSES } from "../constants/tokens";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import { useGetLiquidityPools } from "./queries/useGetLiquidityPools";
import { useAlchemy } from "./useAlchemy";
import { useConvertLenderGroupCommitmentToCommitment } from "./useConvertLenderGroupCommitmentToCommitment";
import { UserToken } from "./useGetUserTokens";
import { useGetTokenImageAndSymbolFromTokenList } from "./useGetTokenImageAndSymbolFromTokenList";
import { useGetTokenList } from "./queries/useGetTokenList";

export const useGetCommitmentsForErc20Tokens = () => {
  const chainId = useChainId();
  const { convertCommitment } = useConvertLenderGroupCommitmentToCommitment();
  const { isStrategiesSection } = useGetGlobalPropsContext();
  const skip = !isStrategiesSection;
  const { getTokenImageAndSymbolFromTokenList } =
    useGetTokenImageAndSymbolFromTokenList();
  const { data: tokenList, isLoading: tokenListLoading } = useGetTokenList();

  const {
    liquidityPools: liquidityPools,
    isLoading: liquidityPoolsLoading,
    isFetched: liquidityPoolsFetched,
  } = useGetLiquidityPools();

  const alchemy = useAlchemy();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [principalErc20Tokens, setPrincipalErc20Tokens] = useState<any[]>([]);
  const [convertedCommitments, setConvertedCommitments] = useState<any[]>([]);

  const chainTokenAddresses = supportedPrincipalTokens
    .map((token: string) => TOKEN_ADDRESSES[chainId]?.[token])
    .filter((token: string) => typeof token === "string");

  useEffect(() => {
    setPrincipalErc20Tokens([]);
  }, [chainId]);

  useEffect(() => {
    if (
      liquidityPoolsLoading ||
      isLoading ||
      (!tokenList?.[chainId] && !tokenListLoading) ||
      (liquidityPoolsFetched && principalErc20Tokens.length > 0) ||
      skip
    ) {
      return;
    }

    (async () => {
      if (!Array.isArray(liquidityPools) || liquidityPools.length === 0) {
        console.warn("No liquidity pools available for filtering");
        return [];
      }

      setIsLoading(true);
      const filteredPools = liquidityPools.filter(
        (pool) =>
          !chainTokenAddresses.includes(
            pool.principal_token_address?.toLowerCase()
          )
      );

      const convertedCommitments = await Promise.all(
        filteredPools.map(convertCommitment)
      );
      setConvertedCommitments(convertedCommitments);
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
              const metadata = await alchemy?.core.getTokenMetadata(address);
              const aggregatedBalance = formatUnits(
                tokenCommitmentMap.get(address) || BigInt(0),
                metadata?.decimals || 18
              );
              return {
                address: address as `0x${string}`,
                name: metadata?.name || "",
                symbol:
                  getTokenImageAndSymbolFromTokenList(address)?.symbol ??
                  (metadata?.symbol || ""),
                logo:
                  metadata?.logo ??
                  getTokenImageAndSymbolFromTokenList(address)?.image ??
                  "",
                balance: aggregatedBalance || "0",
                balanceBigInt: (
                  tokenCommitmentMap.get(address) || BigInt(0)
                ).toString(),
                decimals: metadata?.decimals || 18,
                chainId,
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
      .catch((error) => {
        console.error("Error fetching commitments for ERC20 tokens", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    liquidityPools,
    chainTokenAddresses,
    convertCommitment,
    liquidityPoolsLoading,
    liquidityPoolsFetched,
    principalErc20Tokens.length,
    chainId,
    skip,
    getTokenImageAndSymbolFromTokenList,
  ]);

  const getCommitmentsForErc20TokensByPrincipalToken = useCallback(
    (principalTokenAddress?: string) => {
      return convertedCommitments.filter(
        (commitment) =>
          commitment?.principalToken?.address?.toLowerCase() ===
          principalTokenAddress?.toLowerCase()
      );
    },
    [convertedCommitments]
  );

  return {
    principalErc20Tokens,
    isLoading: liquidityPoolsLoading || isLoading,
    getCommitmentsForErc20TokensByPrincipalToken,
  };
};
