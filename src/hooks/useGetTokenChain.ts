/* eslint-disable @typescript-eslint/no-unsafe-return */
const endpoint = `https://api.dexscreener.com/latest/dex/tokens/`;

type DexScreenerResponse = {
  pairs: any[];
  [key: string]: any;
};

const mapChainNameToId = {
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
  polygon: 137,
};

const supportedChains = ["arbitrum", "base", "polygon", "ethereum"];

export const getTokenChain = (tokenAddress: string): Promise<number> => {
  if (!tokenAddress) {
    return Promise.reject(new Error("Token address is required"));
  }
  return fetch(endpoint + tokenAddress)
    .then((res) => res.json())
    .then((data: DexScreenerResponse) => {
      const chainName = data.pairs.find((pair) =>
        supportedChains.includes(pair.chainId)
      )?.chainId;
      const chainId =
        mapChainNameToId[chainName as keyof typeof mapChainNameToId];
      if (!chainId) {
        throw new Error("Chain ID not found in response");
      }
      return chainId;
    })
    .catch((e) => {
      console.error("Error fetching token chain ID", e);
      throw e;
    });
};
