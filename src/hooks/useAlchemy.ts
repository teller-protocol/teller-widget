import { CHAIN_CONFIG } from "constants/chains";
import { ALCHEMY_API_KEY } from "constants/global";

import { Alchemy } from "@teller-protocol/alchemy-sdk";
import { useMemo } from "react";

import { useChain } from "./useChain";

export const useAlchemy = (): Alchemy | undefined => {
  const { chain } = useChain();

  const chainConfig = useMemo(() => {
    if (!chain) return;
    return CHAIN_CONFIG[chain.id];
  }, [chain]);

  return useMemo(() => {
    if (!chainConfig?.alchemyNetworkKey) return;
    return new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: chainConfig.alchemyNetworkKey,
    });
  }, [chainConfig?.alchemyNetworkKey]);
};
