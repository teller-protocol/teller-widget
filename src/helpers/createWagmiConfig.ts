import { TransportConfig, EIP1193RequestFn } from "viem";
import { http, createConfig, Connector } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
  linea,
  optimism,
  blast,
  mantle,
  manta,
  mode,
} from "wagmi/chains";
import {
  walletConnect,
  coinbaseWallet,
  injected,
  safe,
} from "wagmi/connectors";

import { ALCHEMY_API_KEY } from "../constants/global";

export const config = createConfig({
  chains: [
    mainnet,
    arbitrum,
    optimism,
    base,
    blast,
    mantle,
    linea,
    manta,
    mode,
    polygon,
    sepolia,
  ],
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
    [linea.id]: http(),
    10: http(),
    81457: http(),
    5000: http(),
    169: http(),
    34443: http(),
  },
  connectors: [
    walletConnect({
      projectId: "1c82ac0d6e7e111ef9f9476c00f3c0fa",
    }),
    coinbaseWallet({
      appName: "Teller",
    }),
    injected(),
    safe(),
  ],
});
