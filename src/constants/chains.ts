import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";

export enum SupportedChainId {
  MAINNET = mainnet.id,
  POLYGON = polygon.id,
  ARBITRUM = arbitrum.id,
  BASE = base.id,
}

export function normalizeChainName(chainName?: string) {
  return chainName?.replace(/ /g, "-")?.toLowerCase();
}