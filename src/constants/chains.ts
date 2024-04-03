import { Network } from "@teller-protocol/alchemy-sdk";
import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";

export enum SupportedChainId {
  MAINNET = mainnet.id,
  POLYGON = polygon.id,
  ARBITRUM = arbitrum.id,
  BASE = base.id,
}

interface ChainConfig {
  icon: string;
  alchemyNetworkKey?: Network;
}

export const CHAIN_CONFIG: Record<SupportedChainId, ChainConfig | undefined> = {
  [SupportedChainId.MAINNET]: {
    icon: "logos:ethereum",
    alchemyNetworkKey: Network.ETH_MAINNET,
  },
  [SupportedChainId.POLYGON]: {
    icon: "cryptocurrency:matic",
    iconColor: "#8247E5",
    alchemyNetworkKey: Network.MATIC_MAINNET,
  },
  [SupportedChainId.ARBITRUM]: {
    icon: "cryptocurrency:arbitrum",
    alchemyNetworkKey: Network.ARB_MAINNET,
  },
  [SupportedChainId.GOERLI]: {
    icon: "logos:ethereum",
    alchemyNetworkKey: Network.ETH_GOERLI,
  },
  [SupportedChainId.SEPOLIA]: {
    icon: "logos:ethereum",
    alchemyNetworkKey: Network.ETH_SEPOLIA,
  },
  [SupportedChainId.BASE]: {
    icon: "logos:base",
  },
};
