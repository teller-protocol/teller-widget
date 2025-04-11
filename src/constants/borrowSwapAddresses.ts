import { arbitrum, polygon, base, mainnet } from "viem/chains";

export const BORROW_SWAP_MAINNET_ADDRESS =
  "0x838F8e08C723CA4323cacD07D57777B27eAB3bD4";

export const BORROW_SWAP_POLYGON_ADDRESS =
  "0xC45d42ab810FE432B811D60eb8af172F84a455D3";

export const BORROW_SWAP_ARBITRUM_ADDRESS =
  "0x4B07570D370347490A19e34B9AdD32AF0aFE497c";

export const BORROW_SWAP_BASE_ADDRESS =
  "0x0410535A1C3c59Ce477644f21662b5A96b4bA085";

export const borrowSwapAddressMap = {
  [mainnet.id]: BORROW_SWAP_MAINNET_ADDRESS,
  [polygon.id]: BORROW_SWAP_POLYGON_ADDRESS,
  [arbitrum.id]: BORROW_SWAP_ARBITRUM_ADDRESS,
  [base.id]: BORROW_SWAP_BASE_ADDRESS,
} as { [chainId: string]: string | undefined };
