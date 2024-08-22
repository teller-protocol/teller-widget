import { arbitrum, polygon, base, mainnet } from "viem/chains";

export const LRF_MAINNET_ADDRESS =
  "0xfCd6Aa92D399260E8309800316CEc9b1F123621e";

export const LRF_POLYGON_ADDRESS =
  "0x2Ec547Da3Bff965c84E4CC91dde9E3bA1E57C3DB";

export const LRF_ARBITRUM_ADDRESS =
  "0xa1106d888F1FA689c6935e0983687432eF2a28c1";

export const LRF_BASE_ADDRESS =
  "0x3AF8DB041fcaFA539C2c78f73aa209383ba703ed";

export const lrfAddressMap = {
  [mainnet.id]: LRF_MAINNET_ADDRESS,
  [polygon.id]: LRF_POLYGON_ADDRESS,
  [arbitrum.id]: LRF_ARBITRUM_ADDRESS,
  [base.id]: LRF_BASE_ADDRESS,
} as { [chainId: string]: string | undefined };
