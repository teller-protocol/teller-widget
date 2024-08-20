import { polygon } from "viem/chains";

export const LRF_POLYGON_ADDRESS =
  "0xb8E8b0aa1F49dD5128941571802235457189538d";

export const lrfAddressMap = {
  [polygon.id]: LRF_POLYGON_ADDRESS,
} as { [chainId: string]: string | undefined };
