import teller_contracts from "@teller-protocol/v2-contracts/build/hardhat/contracts.json";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { useChainId } from "wagmi";

export enum SupportedChainId {
  MAINNET = mainnet.id,
  POLYGON = polygon.id,
  ARBITRUM = arbitrum.id,
  BASE = base.id,
  OPTIMISM = optimism.id,
}

export const useContracts = () => {
  const chainId = useChainId();

  const tellerContracts = (<Record<SupportedChainId, any>>teller_contracts)[
    chainId
  ]?.contracts;

  return tellerContracts;
};
