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
    whitelistedTokens: {
      "1": [
        "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
        "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202",
        "0xb23d80f5fefcddaa212212f028021b41ded428cf",
        "0xe0f63a424a4439cbe457d80e4f4b51ad25b2c56c",
        "0x944824290cc12f31ae18ef51216a223ba4063092",
        "0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
        "0x6982508145454ce325ddbe47a25d4ec3d2311933",
        "0x7a58c0be72be218b41c608b7fe7c5bb630736c71",
        "0x73d7c860998ca3c01ce8c808f5577d94d545d1b4",
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
        "0x514910771af9ca656af840dff83e8264ecf986ca",
        "0x72e4f9f808c49a2a61de9c5896298920dc4eeea9",
        "0xa35923162c49cf95e6bf26623385eb431ad920d3",
        "0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4",
        "0xaaee1a9723aadb7afa2810263653a34ba2c21c7a",
        "0x77e06c9eccf2e797fd462a92b6d7642ef85b0a44",
        "0xaea46a60368a7bd060eec7df8cba43b7ef41ad85",
        "0xba386a4ca26b85fd057ab1ef86e3dc7bdeb5ce70",
        "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24",
        "0x812ba41e071c7b7fa4ebcfb62df5f45f6fa853ee",
        "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
        "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
        "0x375abb85c329753b1ba849a601438ae77eec9893",
        "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429",
        "0x427a03fb96d9a94a6727fbcfbba143444090dd64",
        "0x0b7f0e51cd1739d6c96982d55ad8fa634dd43a9c",
        "0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050",
        "0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce",
        "0xd1d2eb1b1e90b638588728b4130137d262c87cae",
        "0xf57e7e7c23978c3caec3c3548e3d615c346e79ff",
        "0x92d6c1e31e14520e676a687f0a93788b716beff5",
        "0x0001a500a6b18995b03f44bb040a5ffc28e45cb0",
        "0x152649ea73beab28c5b49b26eb48f7ead6d4c898",
        "0x9dfad1b7102d46b1b197b90095b5c4e9f5845bba",
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
        "0x808507121b80c02388fad14726482e061b8da827",
        "0xba100000625a3754423978a60c9317c58a424e3d",
        "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
        "0x6810e776880c02933d47db1b9fc05908e5386b96",
        "0x111111111117dc0aa78b770fa6a738034120c302",
        "0xd29da236dd4aac627346e1bba06a619e8c22d7c5",
        "0xd533a949740bb3306d119cc777fa900ba034cd52",
        "0x03dcee0d21ab39614c768dab67bfc33b0fc0a047",
        "0x8802269d1283cdb2a5a329649e5cb4cdcee91ab6",
        "0x6b175474e89094c44da98b954eedeac495271d0f",
        "0xe41d2489571d322189246dafa5ebde1f4699f498",
        "0xdc035d45d973e3ec169d2276ddab16f1e407384f",
        "0x56072c95faa701256059aa122697b133aded9279",
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
        "0xd533a949740bb3306d119cc777fa900ba034cd52",
        "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
        "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202",
        "0x58b9cb810a68a7f3e1e4f8cb45d1b9b3c79705e8",
        "0xd1d2eb1b1e90b638588728b4130137d262c87cae",
        "0x8236a87084f8b84306f72007f36f2618a5634494",
        "0xd533a949740bb3306d119cc777fa900ba034cd52",
        "0x56072c95faa701256059aa122697b133aded9279",
        "0xc00e94cb662c3520282e6f5717214004a7f26888",
        "0x6810e776880c02933d47db1b9fc05908e5386b96",
        "0x226bb599a12c826476e3a771454697ea52e9e220",
        "0xdab396ccf3d84cf2d07c4454e10c8a6f5b008d2b",
        "0x58d97b57bb95320f9a05dc918aef65434969c2b2",
        "0x808507121b80c02388fad14726482e061b8da827",
        "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
        "0x44ff8620b8ca30902395a7bd3f2407e1a091bf73",
        "0x1121acc14c63f3c872bfca497d10926a6098aac5",
        "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24",
        "0xbe03e60757f21f4b6fc8f16676ad9d5b1002e512",
        "0x59a529070fbb61e6d6c91f952ccb7f35c34cf8aa",
        "0xeeee2a2e650697d2a8e8bc990c2f3d04203be06f",
        "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
        "0x090185f2135308bad17527004364ebcc2d37e5f6",
        "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
        "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
        "0xbf5495efe5db9ce00f80364c8b423567e58d2110",
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
        "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
        "0xc00e94cb662c3520282e6f5717214004a7f26888",
        "0x45804880de22913dafe09f4980848ece6ecbaf78",
        "0x28d38df637db75533bd3f71426f3410a82041544",
        "0xf57e7e7c23978c3caec3c3548e3d615c346e79ff",
        "0x3845badade8e6dff049820680d1f14bd3903a5d0",
        "0xbe0ed4138121ecfc5c0e56b40517da27e6c5226b",
        "0x33349b282065b0284d756f0577fb39c158f935e6",
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
        "0x4c19596f5aaff459fa38b0f7ed92f11ae6543784",
        "0x58b9cb810a68a7f3e1e4f8cb45d1b9b3c79705e8",
        "0xc00e94cb662c3520282e6f5717214004a7f26888",
        "0x73d7c860998ca3c01ce8c808f5577d94d545d1b4",
        "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
        "0x35fa164735182de50811e8e2e824cfb9b6118ac2",
        "0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3",
        "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
        "0x3845badade8e6dff049820680d1f14bd3903a5d0",
        "0x57e114b691db790c35207b2e685d4a43181e6061",
        "0x320623b8e4ff03373931769a31fc52a4e78b5d70",
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
        "0x111111111117dc0aa78b770fa6a738034120c302",
        "0x6bfdb6f4e65ead27118592a41eb927cea6956198",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
        "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24",
        "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        "0x6e5970dbd6fc7eb1f29c6d2edf2bc4c36124c0c1",
        "0x7f89f674b7d264944027e78e5f58eb2bbbb7cfa3",
        "0x594daad7d77592a2b97b725a7ad59d7e188b5bfa",
        "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
        "0x7420b4b9a0110cdc71fb720908340c03f9bc03ec",
        "0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa",
        "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
        "0x77fba179c79de5b7653f68b5039af940ada60ce0",
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
        "0x4d224452801aced8b2f0aebe155379bb5d594381",
        "0x5a98fcbea516cf06857215779fd812ca3bef1b32",
        "0x1a2eb478fa07125c9935a77b3c03a82470801e30",
        "0x808507121b80c02388fad14726482e061b8da827",
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
        "0xba100000625a3754423978a60c9317c58a424e3d",
        "0x33349b282065b0284d756f0577fb39c158f935e6",
        "0xc669928185dbce49d2230cc9b0979be6dc797957",
        "0xa1290d69c65a6fe4df752f95823fae25cb99e5a7",
        "0x8143182a775c54578c8b7b3ef77982498866945d",
        "0x657e8c867d8b37dcc18fa4caead9c45eb088c642",
        "0xae78736cd615f374d3085123a210448e74fc6393",
        "0x5283d291dbcf85356a21ba090e6db59121208b44",
        "0xd2ba23de8a19316a638dc1e7a9adda1d74233368",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xd33526068d116ce69f19a9ee46f0bd304f21a51f",
        "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee",
        "0x514910771af9ca656af840dff83e8264ecf986ca",
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        "0x92d6c1e31e14520e676a687f0a93788b716beff5",
        "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
        "0x56072c95faa701256059aa122697b133aded9279",
        "0xd533a949740bb3306d119cc777fa900ba034cd52",
        "0x6b66ccd1340c479b07b390d326eadcbb84e726ba",
        "0x8d65a2eabde4b31cbd7e43f27e47559d1ccec86c",
        "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        "0xa2e3356610840701bdf5611a53974510ae27e2e1",
        "0x44971abf0251958492fee97da3e5c5ada88b9185",
        "0x0d438f3b5175bebc262bf23753c1e53d03432bde",
        "0x5a98fcbea516cf06857215779fd812ca3bef1b32",
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        "0x12652c6d93fdb6f4f37d48a8687783c782bb0d10",
        "0x3593d125a4f7849a1b059e64f4517a86dd60c95d",
      ],
      "137": [
        "0x61299774020da444af134c82fa83e3810b309991",
        "0x172370d5cd63279efa6d502dab29171933a610af",
        "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
        "0x9c2c5fd7b07e95ee044ddeba0e97a665f142394f",
        "0x172370d5cd63279efa6d502dab29171933a610af",
        "0xe5417af564e4bfda1c483642db72007871397896",
        "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
        "0xb5c064f955d8e7f38fe0460c556a72987494ee17",
        "0x282d8efce846a88b159800bd4130ad77443fa1a1",
      ],
      "8453": [
        "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
        "0x2a06a17cbc6d0032cac2c6696da90f29d39a1a29",
        "0x2da56acb9ea78330f947bd57c54119debda7af71",
        "0x0db510e79909666d6dec7f5e49370838c16d950f",
        "0x3055913c90fcc1a6ce9a358911721eeb942013a1",
        "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
        "0x4158734d47fc9692176b5085e0f52ee0da5d47f1",
        "0x22e6966b799c4d5b13be962e1d117b56327fda66",
        "0x57f5fbd3de65dfc0bd3630f732969e5fb97e6d37",
        "0x22e6966b799c4d5b13be962e1d117b56327fda66",
        "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
        "0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842",
        "0x0d97f261b1e88845184f678e2d1e7a98d9fd38de",
        "0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4",
        "0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb",
        "0x1c7a460413dd4e964f96d8dfc56e7223ce88cd85",
        "0x6921b130d297cc43754afba22e5eac0fbf8db75b",
        "0x20d704099b62ada091028bcfc44445041ed16f09",
        "0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf",
        "0x22af33fe49fd1fa80c7149773dde5890d3c76f3b",
        "0x6b2504a03ca4d43d0d73776f6ad46dab2f2a4cfd",
        "0x7A5f5CcD46EBd7aC30615836D988ca3BD57412b3",
        "0x73cb479f2ccf77bad90bcda91e3987358437240a",
        "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b",
        "0x1d008f50fb828ef9debbbeae1b71fffe929bf317",
        "0xafb89a09d82fbde58f18ac6437b3fc81724e4df6",
        "0x01929f1ae2dc8cac021e67987500389ae3536ced",
        "0x3ec2156d4c0a9cbdab4a016633b7bcf6a8d68ea2",
        "0x7A5f5CcD46EBd7aC30615836D988ca3BD57412b3",
        "0x2e2cc4dfce60257f091980631e75f5c436b71c87",
        "0x0578d8a44db98b23bf096a382e016e29a5ce0ffe",
        "0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825",
        "0x1b6a569dd61edce3c383f6d565e2f79ec3a12980",
        "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
        "0x5b5dee44552546ecea05edea01dcd7be7aa6144a",
        "0xecaf81eb42cd30014eb44130b89bcd6d4ad98b92",
        "0x532f27101965dd16442e59d40670faf5ebb142e4",
        "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
      ],
      "42161": [
        "0x25d887ce7a35172c62febfd67a1856f20faebb00",
        "0x8b0e6f19ee57089f7649a455d89d7bc6314d04e8",
        "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
        "0x221a0f68770658c15b525d0f89f5da2baab5f321",
        "0x1b896893dfc86bb67cf57767298b9073d2c1ba2c",
        "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8",
        "0xa0b862f60edef4452f25b4160f177db44deb6cf1",
        "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
        "0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af",
        "0x3082cc23568ea640225c2467653db90e9250aaa0",
        "0xe22c452bd2ade15dfc8ad98286bc6bdf0c9219b7",
        "0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8",
      ],
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

export const Strategies: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    showStrategiesSection: true,
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

export const Trade: Story = {
  args: {
    subgraphApiKey: SUBGRAPH_API_KEY,
    isTradeMode: true,
    strategy: STRATEGY_ACTION_ENUM.LONG,
    strategyToken: "0x1bc0c42215582d5a085795f4badbac3ff36d1bcb",
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
