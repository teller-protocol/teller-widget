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
        defaultValue: false,
        disable: true,
      },
    },
  },
  args: {
    whitelistedTokens: {
      [1]: [
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xb23d80f5fefcddaa212212f028021b41ded428cf",
        "0x6982508145454ce325ddbe47a25d4ec3d2311933",
      ],
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
  tags: ["!autodocs"],
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
  tags: ["!autodocs"],
};
