import { polygon } from "viem/chains";

export const LRF_POLYGON_ADDRESS =
  "0x208289DD22D4cf59fb18A2CE073A128D5286bD2F";

export const lrfAddressMap = {
  [polygon.id]: LRF_POLYGON_ADDRESS,
} as { [chainId: string]: string | undefined };
