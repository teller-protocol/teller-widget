import { arbitrum, polygon } from "viem/chains";

export const RFW_POLYGON_ADDRESS =
  "0x7744dc954117540240232867584065CC317a9877";

export const RFW_ARBITRUM_ADDRESS =
  "0xdb2Ba4a2b90c6670f240D59AfcBeb35cd9Edd515";

export const rfwAddressMap = {
  [polygon.id]: RFW_POLYGON_ADDRESS,
  [arbitrum.id]: RFW_ARBITRUM_ADDRESS,
} as { [chainId: string]: string | undefined };
