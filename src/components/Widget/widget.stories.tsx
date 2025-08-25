import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import ConnectWalletButton from "../../../.storybook/components/ConnectWalletButton";
import { STRATEGY_ACTION_ENUM } from "../../contexts/GlobalPropsContext";
import { config } from "../../helpers/createWagmiConfig";

import "./widgetStories.scss";
import Widget from ".";

const SUBGRAPH_API_KEY = "d7f7ac0a5cdc272ad9395816361281c5";

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
      defaultValue: undefined,
    },
    buttonClassName: {
      description: "Class name for the button.",
      defaultValue: "",
    },
    buttonLabel: {
      description: "Label for the button.",
      defaultValue: "Cash advance",
    },
    buttonColorPrimary: {
      description:
        "Background color for the primary button. Must be in hex format, including the #, ie #ffffff",
      defaultValue: "",
    },
    buttonTextColorPrimary: {
      description:
        "Text color for the primary button. Must be in hex format, including the #, ie #ffffff",
      defaultValue: "",
    },
    isBareButton: {
      description:
        "Flag to remove all styling for the button for easier overwriting.",
      defaultValue: false,
    },
    isEmbedded: {
      description: "Embed the widget navtively as a component.",
      defaultValue: false,
    },
    showChainSwitch: {
      description: "Shows a chain switch component within the widget.",
      defaultValue: true,
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
    referralFee: {
      description:
        "Referral fee %, in basis points. For example, 100 = 1%, max 500 = 5%.",
      defaultValue: "0",
      control: {
        type: "number",
        min: 0,
        max: 500,
        step: 1,
      },
    },
    referralAddress: {
      description: "Recipient wallet address to receive referral fee.",
      defaultValue: "0x0000000000000000000000000000000000000000",
    },
    welcomeScreenLogo: {
      description:
        "Logo (as a URL) to be displayed on the widget's welcome screen.",
      defaultValue:
        "https://pbs.twimg.com/profile_images/1711805553700470784/5Je325YE_400x400.jpg",
    },
    welcomeScreenTitle: {
      description: "Bold, header text on the widget's welcome screen.",
      defaultValue: "DeFi's cash advance",
    },
    welcomeScreenParagraph: {
      description: "Body, paragraph text on the widget's welcome screen.",
      defaultValue:
        "Time-based loans, up to thirty days, with no margin-call liquidations.",
    },
    subgraphApiKey: {
      table: {
        disable: true,
      },
    },
    strategy: {
      description: "Set the initial strategy (LONG/SHORT)",
      options: [STRATEGY_ACTION_ENUM.LONG, STRATEGY_ACTION_ENUM.SHORT],
      control: { type: "select" },
    },
    strategyToken: {
      description: "Token address to automatically load in strategy section",
      control: { type: "text" },
    },
    borrowToken: {
      description: "Token address to automatically load in borrow section",
      control: { type: "text" },
    },
  },
  args: {
    hideAutoConnectModal: true,
    whitelistedChains: [1, 137, 42161, 8453],
  },
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Main: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    cacheKey: "main",
  },
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

export const Strategies: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    showStrategiesSection: true,
    cacheKey: "strategies",
  },
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

export const Pair: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    isEmbedded: true,
    showChainSwitch: false,
    singleWhitelistedToken: "0x427a03fb96d9a94a6727fbcfbba143444090dd64",
    whitelistedTokens: { [1]: ["0x427a03fb96d9a94a6727fbcfbba143444090dd64"] },
    showOnlyWhiteListedTokens: true,
    showPoolSection: true,
    showRepaySection: false,
    widgetChainId: 1,
    hideAutoConnectModal: true,
    principalTokenForPair: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    cacheKey: "pair",
  },
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
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    cacheKey: "autoopen",
  },
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

export const Trade: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    isTradeMode: true,
    strategy: STRATEGY_ACTION_ENUM.LONG,
    strategyToken: "0x1bc0c42215582d5a085795f4badbac3ff36d1bcb",
    cacheKey: "trade",
  },
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

export const Loop: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    showLoopSection: true,
  },
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
