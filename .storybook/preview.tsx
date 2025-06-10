import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "../src/helpers/createWagmiConfig";
import ConnectWalletButton from "./components/ConnectWalletButton";

// Create a QueryClient instance outside the decorator to avoid recreating it on every render
const queryClient = new QueryClient();

export const decorators = [
  (Story) => (
    <WagmiProvider config={config}>
      <Story />
      <ConnectWalletButton />
    </WagmiProvider>
  ),
];
