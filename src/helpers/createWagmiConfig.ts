import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum, base } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId: "1c82ac0d6e7e111ef9f9476c00f3c0fa",
    }),
  ],
});
