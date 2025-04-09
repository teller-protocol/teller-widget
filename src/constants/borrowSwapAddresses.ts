import { arbitrum, polygon, base, mainnet } from "viem/chains";

export const BORROW_SWAP_MAINNET_ADDRESS =
  "";

export const BORROW_SWAP_POLYGON_ADDRESS =
  "0xC45d42ab810FE432B811D60eb8af172F84a455D3";

export const BORROW_SWAP_ARBITRUM_ADDRESS =
  "";

export const BORROW_SWAP_BASE_ADDRESS =
  "";

export const borrowSwapAddressMap = {
  [mainnet.id]: BORROW_SWAP_MAINNET_ADDRESS,
  [polygon.id]: BORROW_SWAP_POLYGON_ADDRESS,
  [arbitrum.id]: BORROW_SWAP_ARBITRUM_ADDRESS,
  [base.id]: BORROW_SWAP_BASE_ADDRESS,
} as { [chainId: string]: string | undefined };
