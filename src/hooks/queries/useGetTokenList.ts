import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const endpoint = `https://tbot2.teller.org/get-json-file`;

export type UniswapToken = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

export const useGetTokenList = () => {
  const { data, isLoading, refetch } = useQuery<
    Record<number, UniswapToken[]>,
    Error
  >({
    queryKey: ["teller-widget", "getTellerTokenList"],
    queryFn: async () =>
      fetch(endpoint)
        .then((res) => res.json())
        .then((data: { tokens: UniswapToken[] }) => {
          const tokens = data.tokens;
          const tokensObj: Record<number, UniswapToken[]> = {};
          tokens.forEach((token: UniswapToken) => {
            if (
              !token.chainId ||
              !token.address ||
              !token.name ||
              !token.symbol
            )
              return;
            if (!tokensObj[token.chainId]) {
              tokensObj[token.chainId] = [];
            }
            tokensObj[token.chainId].push({
              ...token,
            });
          });
          return tokensObj;
        })
        .catch((e) => {
          console.error("Error fetching token list", e);
          throw e;
        }),
  });

  return { data, isLoading, refetch };
};
