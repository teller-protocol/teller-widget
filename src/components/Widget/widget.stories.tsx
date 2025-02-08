import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import ConnectWalletButton from "../../../.storybook/components/ConnectWalletButton";
import { config } from "../../helpers/createWagmiConfig";

import "./widgetStories.scss";
import Widget from ".";

const SUBGRAPH_API_KEY = "945bcc23bc7f0a6f3956725a9c3513a1";

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
  },
  args: {
    whitelistedTokens: {
      [1]: [
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xb23d80f5fefcddaa212212f028021b41ded428cf",
      ],
      [42161]: ["0x221a0f68770658c15b525d0f89f5da2baab5f321"],
    },
    whitelistedChains: [1, 137, 42161, 8453],
  },
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Main: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
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
