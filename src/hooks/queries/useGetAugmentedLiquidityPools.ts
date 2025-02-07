// src/hooks/useAugmentedPools.ts
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { formatUnits } from "viem";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { SUPPORTED_TOKEN_LOGOS } from "../../constants/tokens";
import { LenderGroupsPoolMetrics } from "../../types/LenderGroupsPoolMetrics";

// Replace this function with your actual implementation for fetching token metadata.
async function fetchTokenMetadata(address: string): Promise<any> {
  // For demonstration, we return dummy data.
  return {
    symbol: address.slice(0, 6).toUpperCase(), // Dummy symbol based on address.
    logo: null,
    decimals: 18,
  };
}

export interface AugmentedLenderGroupsPoolMetrics extends LenderGroupsPoolMetrics {
  principalTokenSymbol: string;
  collateralTokenSymbol: string;
  principalLogoUrl: string;
  collateralLogoUrl: string;
  trueLiquidityFormatted: string;
}

/**
 * Custom hook that augments pool objects with token metadata and computed fields.
 *
 * @param liquidityPools - Array of pool objects from context.
 * @returns Object containing the augmented pools and a loading flag.
 */
export const useAugmentedPools = (liquidityPools: any[]) => {
  // 1. Extract all unique token addresses.
  const tokenAddresses = useMemo(() => {
    if (!liquidityPools) return [];
    const addresses = new Set<string>();
    liquidityPools.forEach((pool) => {
      if (pool.principal_token_address)
        addresses.add(pool.principal_token_address);
      if (pool.collateral_token_address)
        addresses.add(pool.collateral_token_address);
    });
    return Array.from(addresses);
  }, [liquidityPools]);

  // 2. Use TanStack Query's useQueries to fetch metadata for each unique token address.
  const tokenMetadataQueries = useQueries({
    queries: tokenAddresses.map((address) => ({
      queryKey: ["tokenMetadata", address],
      queryFn: () => fetchTokenMetadata(address),
      // You can configure staleTime, cacheTime, etc., here.
    })),
  });

  // Build a lookup table from token address to its metadata.
  const tokenMetadataMap = useMemo(() => {
    return tokenMetadataQueries.reduce<Record<string, any>>((acc, query, index) => {
      acc[tokenAddresses[index]] = query.data;
      return acc;
    }, {});
  }, [tokenMetadataQueries, tokenAddresses]);

  // Determine if any metadata queries are still loading.
  const loadingMetadata = tokenMetadataQueries.some((query) => query.isLoading);

  // 3. Augment each pool with token symbols, logos, and computed liquidity.
  const augmentedPools = useMemo(() => {
    if (!liquidityPools) return [];
    return liquidityPools.map((pool) => {
      // Get metadata for both tokens.
      const principalTokenMetadata =
        tokenMetadataMap[pool.principal_token_address];
      const collateralTokenMetadata =
        tokenMetadataMap[pool.collateral_token_address];

      const principalTokenSymbol = principalTokenMetadata?.symbol || "";
      const collateralTokenSymbol = collateralTokenMetadata?.symbol || "";

      // Determine logo URLs (with fallback to defaults).
      const principalLogo =
        principalTokenMetadata?.logo ??
        SUPPORTED_TOKEN_LOGOS[principalTokenSymbol];
      const principalLogoUrl = principalLogo ? principalLogo : defaultTokenImage;

      const collateralLogo =
        collateralTokenMetadata?.logo ??
        SUPPORTED_TOKEN_LOGOS[collateralTokenSymbol];
      const collateralLogoUrl = collateralLogo ? collateralLogo : defaultTokenImage;

      // Calculate true liquidity using BigInt arithmetic.
      const committed = BigInt(pool.total_principal_tokens_committed);
      const withdrawn = BigInt(pool.total_principal_tokens_withdrawn);
      const interest = BigInt(pool.total_interest_collected);
      const trueLiquidity = committed - withdrawn + interest;

      const principalTokenDecimals = principalTokenMetadata?.decimals || 18;
      const trueLiquidityFormatted = formatUnits(trueLiquidity, principalTokenDecimals);

      return {
        ...pool,
        principalTokenSymbol,
        collateralTokenSymbol,
        principalLogoUrl,
        collateralLogoUrl,
        trueLiquidityFormatted,
      };
    });
  }, [liquidityPools, tokenMetadataMap]);

  return {
    augmentedPools,
    isLoading: loadingMetadata,
  };
};
