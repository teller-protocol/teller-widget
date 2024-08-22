import { polygon } from "viem/chains";

export const RFW_POLYGON_ADDRESS =
  "0x7744dc954117540240232867584065CC317a9877";

export const rfwAddressMap = {
  [polygon.id]: RFW_POLYGON_ADDRESS,
} as { [chainId: string]: string | undefined };
