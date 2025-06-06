import { Alchemy, Network } from "alchemy-sdk";
import { useChainId } from "wagmi";

import { useMemo } from "react";
import { arbitrum, base, mainnet, polygon } from "viem/chains";
import { ALCHEMY_API_KEY } from "../constants/global";

export const mapChainIdToAlchemyNetworkKey: {
  [key: number]: Network | undefined;
} = {
  [mainnet.id]: Network.ETH_MAINNET,
  [polygon.id]: Network.MATIC_MAINNET,
  [arbitrum.id]: Network.ARB_MAINNET,
  [base.id]: Network.BASE_MAINNET,
};

export const useAlchemy = (): Alchemy | undefined => {
  const chainId = useChainId();

  return useMemo(() => {
    if (!mapChainIdToAlchemyNetworkKey[chainId]) {
      return;
    }
    return new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: mapChainIdToAlchemyNetworkKey[chainId],
    });
  }, [chainId]);
};
