import { useCallback } from "react";

import { uniswapV3Api } from "../services/uniswapV3Api";
import { useChainId } from "wagmi";
import { AddressStringType } from "../types/addressStringType";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";

export const useGetTokenPriceFromDerivedETH = (
  token?: AddressStringType,
  tokenAmount?: number
) => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();

  const {
    useGetEthPriceUSDQuery,
    useGetTokenDerivedETHQuery,
    useLazyGetTokenDerivedETHQuery,
  } = uniswapV3Api;

  const [getTokenDerivedETH] = useLazyGetTokenDerivedETHQuery();

  const {
    data: derivedETHData,
    isLoading: derivedETHLoading,
    error: derivedETHError,
  } = useGetTokenDerivedETHQuery({
    tokenId: token?.toLowerCase() ?? "0x",
    chainId: chainId ?? 0,
    subgraphApiKey,
  });

  const {
    data: ethPriceUSDData,
    isLoading: ethPriceUSDLoading,
    error: ethPriceUSDError,
  } = useGetEthPriceUSDQuery({
    chainId: 1,
    subgraphApiKey,
  });
  const derivedETH = derivedETHData?.token?.derivedETH;
  const ethPriceUSD = ethPriceUSDData?.bundle?.ethPriceUSD;

  const tokenPriceInUSD =
    (tokenAmount ?? 0) * +(derivedETH ?? 0) * +(ethPriceUSD ?? 0);

  const getTokenPrice = useCallback(
    async (tokenAddress: AddressStringType, tokenAmount: number) => {
      try {
        const derivedETHResponse = await getTokenDerivedETH({
          tokenId: tokenAddress.toLowerCase(),
          chainId: chainId ?? 0,
          subgraphApiKey,
        });

        const tokenDerivedETH = Number(
          derivedETHResponse.data?.token?.derivedETH
        );

        if (!tokenDerivedETH || !ethPriceUSD) {
          return null;
        }

        const tokenPriceInUSD = tokenAmount * +tokenDerivedETH * +ethPriceUSD;

        return tokenPriceInUSD;
      } catch (error) {
        console.error("Error fetching token price:", error);
        return null;
      }
    },
    [chainId, getTokenDerivedETH, ethPriceUSD]
  );

  return {
    getTokenPrice,
    tokenPriceInUSD,
    isLoading: derivedETHLoading || ethPriceUSDLoading,
    error: derivedETHError || ethPriceUSDError,
  };
};
