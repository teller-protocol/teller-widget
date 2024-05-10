import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum, base } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";
import { ALCHEMY_API_KEY } from "../constants/global";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, base],
  transports: {
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    ),
    [sepolia.id]: http(),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    ),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    ),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  },
  connectors: [
    walletConnect({
      projectId: "1c82ac0d6e7e111ef9f9476c00f3c0fa",
    }),
  ],
});
