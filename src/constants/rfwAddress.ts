import { polygon } from "viem/chains";

export const RFW_POLYGON_ADDRESS =
  "0x62C4D65a8240785b7240bf5A8e21E16474D757F1";

export const rfwAddressMap = {
  [polygon.id]: RFW_POLYGON_ADDRESS,
} as { [chainId: string]: string | undefined };
