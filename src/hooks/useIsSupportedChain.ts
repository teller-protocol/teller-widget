import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { useAccount } from "wagmi";

export const supportedChains = [mainnet, polygon, arbitrum, base, optimism];

export const supportedChainsNames = [
  "ethereum",
  "arbitrum",
  "base",
  "polygon",
  "optimism",
];

const supportedChainsIds: number[] = [
  mainnet.id,
  polygon.id,
  arbitrum.id,
  base.id,
  optimism.id,
];

export const useIsSupportedChain = () => {
  const { chain, address } = useAccount();
  const { whitelistedChains } = useGetGlobalPropsContext();

  return (
    !address ||
    (chain?.id && (whitelistedChains ?? supportedChainsIds)?.includes(chain.id))
  );
};
