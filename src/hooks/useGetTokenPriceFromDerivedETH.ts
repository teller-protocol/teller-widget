import { useCallback, useMemo } from "react";
import { useChainId } from "wagmi";
import { AddressStringType } from "../types/addressStringType";
import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import {
  useTokenDerivedETH,
  useEthPriceUSD,
  fetchTokenDerivedETH,
  fetchEthPriceUSD,
} from "../services/uniswapV3Api";

export const useGetTokenPriceFromDerivedETH = (
  token?: AddressStringType,
  tokenAmount?: number
) => {
  const chainId = useChainId();
  const { subgraphApiKey } = useGetGlobalPropsContext();

  const {
    data: derivedETHData,
    isLoading: derivedETHLoading,
    error: derivedETHError,
  } = useTokenDerivedETH({
    tokenId: token?.toLowerCase() ?? "0x",
    chainId: chainId ?? 0,
    subgraphApiKey,
  });

  const {
    data: ethPriceUSDData,
    isLoading: ethPriceUSDLoading,
    error: ethPriceUSDError,
  } = useEthPriceUSD({
    chainId: 1,
    subgraphApiKey,
  });

  const tokenPriceInUSD = useMemo(() => {
    const derivedETH = Number(derivedETHData?.derivedETH ?? 0);
    const ethPriceUSD = Number(ethPriceUSDData?.ethPriceUSD ?? 0);
    return (tokenAmount ?? 0) * derivedETH * ethPriceUSD;
  }, [tokenAmount, derivedETHData?.derivedETH, ethPriceUSDData?.ethPriceUSD]);

  const getTokenPrice = useCallback(
    async (tokenAddress: AddressStringType, tokenAmount: number) => {
      try {
        const tokenDerived = await fetchTokenDerivedETH({
          tokenId: tokenAddress.toLowerCase(),
          chainId: chainId ?? 0,
          subgraphApiKey,
        });

        const ethPrice = await fetchEthPriceUSD({
          chainId: 1,
          subgraphApiKey,
        });

        const derived = Number(tokenDerived?.derivedETH ?? 0);
        const ethPriceNum = Number(ethPrice?.ethPriceUSD ?? 0);

        if (!derived || !ethPriceNum) return null;

        return tokenAmount * derived * ethPriceNum;
      } catch (err) {
        console.error("Error fetching token price:", err);
        return null;
      }
    },
    [chainId, subgraphApiKey]
  );

  return {
    getTokenPrice,
    tokenPriceInUSD,
    isLoading: derivedETHLoading || ethPriceUSDLoading,
    error: derivedETHError || ethPriceUSDError,
  };
};
