import { SupportedChainId } from "./chains";

export const ETH = "ETH";
export const MATIC = "MATIC";

export enum SupportedTokensEnum {
  USDC = "USDC",
  WETH = "WETH",
  DAI = "DAI",
  USDT = "USDT",
  WMATIC = "WMATIC",
  ARB = "ARB",
  "USDC.e" = "USDC.e",
  "USDbC" = "USDbC",
}

export enum CollateralTokensEnum {
  USDC = "USDC",
  WETH = "WETH",
  DAI = "DAI",
  USDT = "USDT",
  WTAO = "WTAO",
  WMATIC = "WMATIC",
  GOHM = "GOHM",
  OHM = "OHM",
  STMATIC = "STMATIC",
}

export const supportedPrincipalTokens = Object.values(SupportedTokensEnum);

export const WETH_MAINNET_ADDRESS =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const USDC_MAINNET_ADDRESS =
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const WBTC_MAINNET_ADDRESS =
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
export const DAI_MAINNET_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
export const USDT_MAINNET_ADDRESS =
  "0xdac17f958d2ee523a2206206994597c13d831ec7";
export const WTAO_MAINNET_ADDRESS =
  "0x77e06c9eccf2e797fd462a92b6d7642ef85b0a44";
export const WMATIC_MAINNET_ADDRESS =
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0";
export const GOHM_MAINNET_ADDRESS =
  "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f";
export const OHM_MAINNET_ADDRESS = "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5";

export const WETH_POLYGON_ADDRESS =
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
export const USDC_POLYGON_ADDRESS =
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
export const USDCE_POLYGON_ADDRESS =
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
export const WBTC_POLYGON_ADDRESS =
  "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6";
export const DAI_POLYGON_ADDRESS = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063";
export const USDT_POLYGON_ADDRESS =
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
export const WMATIC_POLYGON_ADDRESS =
  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
export const MATIC_POLYGON_ADDRESS =
  "0x0000000000000000000000000000000000001010";
export const STMATIC_POLYGON_ADDRESS =
  "0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4";

export const WETH_ARBITRUM_ADDRESS =
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
export const USDC_ARBITRUM_ADDRESS =
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
export const USDCE_ARBITRUM_ADDRESS =
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
export const WBTC_ARBITRUM_ADDRESS =
  "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f";
export const DAI_ARBITRUM_ADDRESS =
  "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
export const USDT_ARBITRUM_ADDRESS =
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
export const ARB_ARBITRUM_ADDRESS =
  "0x912ce59144191c1204e64559fe8253a0e49e6548";

export const WETH_GOERLI_ADDRESS = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";
export const USDC_GOERLI_ADDRESS = "0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c";
export const WBTC_GOERLI_ADDRESS = "0xc04b0d3107736c32e19f1c62b2af67be61d63a05";
export const DAI_GOERLI_ADDRESS = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";
export const USDT_GOERLI_ADDRESS = "0xc57be6dc821b0b64068c797051cb1539caf5c5ba";
export const WMATIC_GOERLI_ADDRESS =
  "0x7cd0e8ff09cEB653813bD3d63d0554c1CB4BFdf6";

export const WETH_SEPOLIA_ADDRESS =
  "0xD0dF82dE051244f04BfF3A8bB1f62E1cD39eED92";
export const USDC_SEPOLIA_ADDRESS =
  "0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c";
export const WBTC_SEPOLIA_ADDRESS =
  "0xc04b0d3107736c32e19f1c62b2af67be61d63a05";
export const DAI_SEPOLIA_ADDRESS = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";
export const USDT_SEPOLIA_ADDRESS =
  "0x7169d38820dfd117c3fa1f22a697dba58d90ba06";

export const WETH_BASE_ADDRESS = "0x4200000000000000000000000000000000000006";
export const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const USDBC_BASE_ADDRESS = "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA";
export const DAI_BASE_ADDRESS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";

export const TOKEN_ADDRESSES: Record<
  SupportedChainId,
  Record<string, string>
> = {
  [SupportedChainId.MAINNET]: {
    [SupportedTokensEnum.WETH]: WETH_MAINNET_ADDRESS,
    [SupportedTokensEnum.USDC]: USDC_MAINNET_ADDRESS,
    [SupportedTokensEnum.DAI]: DAI_MAINNET_ADDRESS,
    [SupportedTokensEnum.USDT]: USDT_MAINNET_ADDRESS,
    WTAO: WTAO_MAINNET_ADDRESS,
    WMATIC: WMATIC_MAINNET_ADDRESS,
    GOHM: GOHM_MAINNET_ADDRESS,
    OHM: OHM_MAINNET_ADDRESS,
  },
  [SupportedChainId.POLYGON]: {
    [SupportedTokensEnum.WETH]: WETH_POLYGON_ADDRESS,
    [SupportedTokensEnum.USDC]: USDC_POLYGON_ADDRESS,
    [SupportedTokensEnum.DAI]: DAI_POLYGON_ADDRESS,
    [SupportedTokensEnum.USDT]: USDT_POLYGON_ADDRESS,
  },
  [SupportedChainId.ARBITRUM]: {
    [SupportedTokensEnum.WETH]: WETH_ARBITRUM_ADDRESS,
    [SupportedTokensEnum.USDC]: USDC_ARBITRUM_ADDRESS,
    [SupportedTokensEnum["USDC.e"]]: USDCE_ARBITRUM_ADDRESS,
    [SupportedTokensEnum.DAI]: DAI_ARBITRUM_ADDRESS,
    [SupportedTokensEnum.USDT]: USDT_ARBITRUM_ADDRESS,
    ARB: ARB_ARBITRUM_ADDRESS,
  },
  [SupportedChainId.BASE]: {
    [SupportedTokensEnum.WETH]: WETH_BASE_ADDRESS,
    [SupportedTokensEnum.USDC]: USDC_BASE_ADDRESS,
    [SupportedTokensEnum["USDbC"]]: USDBC_BASE_ADDRESS,
    [SupportedTokensEnum.DAI]: DAI_BASE_ADDRESS,
  },
};

export const SUPPORTED_TOKEN_LOGOS: Record<string, string> = {
  [SupportedTokensEnum.WETH]:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  [SupportedTokensEnum.USDC]:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  [SupportedTokensEnum.DAI]:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735/logo.png",
  [SupportedTokensEnum.USDT]:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  [SupportedTokensEnum.WMATIC]:
    "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
  [SupportedTokensEnum.ARB]: "https://arbitrum.foundation/logo.png",
  [SupportedTokensEnum["USDC.e"]]:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  [SupportedTokensEnum["USDbC"]]:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
};

export const WETH_ADDRESSES = [
  WETH_MAINNET_ADDRESS,
  WETH_POLYGON_ADDRESS,
  WETH_ARBITRUM_ADDRESS,
  WETH_BASE_ADDRESS,
];

export const ALL_USDC_ADDRESSES = [
  USDC_MAINNET_ADDRESS,
  USDC_POLYGON_ADDRESS,
  USDC_ARBITRUM_ADDRESS,
  USDC_BASE_ADDRESS,
  USDCE_POLYGON_ADDRESS,
  USDCE_ARBITRUM_ADDRESS,
  USDBC_BASE_ADDRESS,
];

export const HARRY_POTTER_OBAMA_SONIC_10_INU_ADDRESSES = [
  "0x72e4f9f808c49a2a61de9c5896298920dc4eeea9",
  "0x2a06a17cbc6d0032cac2c6696da90f29d39a1a29",
];
