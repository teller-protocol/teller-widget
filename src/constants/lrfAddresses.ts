import { polygon } from "viem/chains";

export const LRF_POLYGON_ADDRESS =
  "0x2Ec547Da3Bff965c84E4CC91dde9E3bA1E57C3DB";

export const lrfAddressMap = {
  [polygon.id]: LRF_POLYGON_ADDRESS,
} as { [chainId: string]: string | undefined };
