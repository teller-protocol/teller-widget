import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import ConnectWalletButton from "../../../.storybook/components/ConnectWalletButton";
import { config } from "../../helpers/createWagmiConfig";

import "./widgetStories.scss";
import Widget from ".";

const meta = {
  title: "Widget",
  component: Widget,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    whitelistedTokens: {
      description: "Array of addressed organized by chain id.",
      defaultValue: {},
    },
    buttonClassName: {
      description: "Class name for the button.",
      defaultValue: "",
    },
    buttonLabel: {
      description: "Label for the button.",
      defaultValue: "Cash advance",
    },
    isBareButton: {
      description:
        "Flag to remove all styling for the button for easier overwriting.",
      defaultValue: false,
    },
    showOnlyWhiteListedTokens: {
      defaultValue: false,
      description: "Flag to show only whitelisted tokens.",
    },
    showModalByDefault: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    whitelistedTokens: {
      [137]: [
        "0x61299774020da444af134c82fa83e3810b309991",
        "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      ],
      [1]: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
    },
  },
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Main: Story = {
  render: function Render(args) {
    const queryClient = new QueryClient();

    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Widget {...args} />
          <ConnectWalletButton />
        </QueryClientProvider>
      </WagmiProvider>
    );
  },
};

export const AutoOpen: Story = {
  render: function Render(args) {
    const queryClient = new QueryClient();

    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Widget {...args} showModalByDefault />
          <ConnectWalletButton />
        </QueryClientProvider>
      </WagmiProvider>
    );
  },
};
