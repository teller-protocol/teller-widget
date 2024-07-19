import { useGetUserTokenContext } from "../contexts/UserTokensContext";
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
  const { whitelistedChains } = useGetUserTokenContext();

  return (
    !address ||
    (chain?.id && (whitelistedChains ?? supportedChains)?.includes(chain.id))
  );
};
