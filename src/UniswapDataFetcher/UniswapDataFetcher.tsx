import React, { useEffect } from "react";
import { useUniswapV3Data, UniswapData } from "../hooks/queries/useUniswapV3Data";

interface UniswapDataFetcherProps {
  tokenAddress: string;
  onData: (data: UniswapData) => void;
}

const UniswapDataFetcher: React.FC<UniswapDataFetcherProps> = ({ tokenAddress, onData }) => {
  const { bestPool, aggregatedFeesUSD, totalUSDValue, apy, isLoading } = useUniswapV3Data(tokenAddress);

  useEffect(() => {
    if (!isLoading) {
      onData({ bestPool, aggregatedFeesUSD, totalUSDValue, apy, isLoading });
    }
  }, [isLoading, bestPool, aggregatedFeesUSD, totalUSDValue, apy, onData]);

  return null;
};

export default UniswapDataFetcher;