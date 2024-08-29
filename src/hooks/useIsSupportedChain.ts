import { useGetGlobalPropsContext } from "../contexts/GlobalPropsContext";
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
  const { whitelistedChains } = useGetGlobalPropsContext();

  return (
    !address ||
    (chain?.id && (whitelistedChains ?? supportedChains)?.includes(chain.id))
  );
};
