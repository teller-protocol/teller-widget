import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const endpoint = `https://tbot.teller.org/get-json-file`;

type UniswapToken = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

export const useGetTokenList = () => {
  const [tokenListByChain, setTokenListBychain] = useState<
    Record<number, UniswapToken[]>
  >({});

  const { data, isLoading } = useQuery<
    {
      tokens: UniswapToken[];
    },
    Error
  >({
    queryKey: ["getTellerTokenList"],
    queryFn: async () =>
      fetch(endpoint)
        .then((res) => res.json())
        .catch((e) => console.error("Error fetching token list", e)),
  });

  useEffect(() => {
    const tokensObj: Record<number, UniswapToken[]> = {};
    if (!data) return;
    const tokens = data.tokens;
    tokens.forEach((token) => {
      if (!token.chainId || !token.address || !token.name || !token.symbol)
        return;
      if (!tokensObj?.[token.chainId]) tokensObj[token.chainId] = [];
      tokensObj?.[token.chainId].push({
        ...token,
      });
    });
    setTokenListBychain(tokensObj);
  }, [data]);

  return { data: tokenListByChain, isLoading };
};
