import { arbitrum, polygon, base, mainnet } from "viem/chains";

export const LCF_ALPHA_MAINNET_ADDRESS =
  "0x0d1047229b9851eace463fb25f27982a5127c20f";

export const LCF_ALPHA_POLYGON_ADDRESS =
  "0xa1106d888f1fa689c6935e0983687432ef2a28c1";

export const LCF_ALPHA_ARBITRUM_ADDRESS =
  "0x6455f2e1ccb14bd0b675a309276fb5333dec524f";

export const LCF_ALPHA_BASE_ADDRESS =
  "0xfa87381128aaf95fb637bba0b760ba2f9970c2b5";

export const lcfAlphaAddressMap = {
  [mainnet.id]: LCF_ALPHA_MAINNET_ADDRESS,
  [polygon.id]: LCF_ALPHA_POLYGON_ADDRESS,
  [arbitrum.id]: LCF_ALPHA_ARBITRUM_ADDRESS,
  [base.id]: LCF_ALPHA_BASE_ADDRESS,
} as { [chainId: string]: string | undefined };
