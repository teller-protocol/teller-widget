import { arbitrum, base, mainnet, polygon } from "viem/chains";
import { useAccount } from "wagmi";

const supportedChains: number[] = [
  mainnet.id,
  polygon.id,
  arbitrum.id,
  base.id,
];

export const useIsSupportedChain = () => {
  const { chain, address } = useAccount();

  return !address || (chain?.id && supportedChains.includes(chain.id));
};