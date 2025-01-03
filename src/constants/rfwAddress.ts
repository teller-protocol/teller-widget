import { arbitrum, polygon, base, mainnet } from "viem/chains";

export const RFW_MAINNET_ADDRESS =
  "0x0b65C94CfF84afa6D9CE3D287b1227D9Cc7CdfB7";

export const RFW_POLYGON_ADDRESS =
  "0x7744dc954117540240232867584065CC317a9877";

export const RFW_ARBITRUM_ADDRESS =
  "0xdb2Ba4a2b90c6670f240D59AfcBeb35cd9Edd515";

export const RFW_BASE_ADDRESS =
  "0x5d3eCF8877eDAB28e14bD7d243fA8B0fE416E95E";

export const rfwAddressMap = {
  [mainnet.id]: RFW_MAINNET_ADDRESS,
  [polygon.id]: RFW_POLYGON_ADDRESS,
  [arbitrum.id]: RFW_ARBITRUM_ADDRESS,
  [base.id]: RFW_BASE_ADDRESS,
} as { [chainId: string]: string | undefined };
