import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum, base } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});
