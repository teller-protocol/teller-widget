import { Address } from "viem";

export const cutAddressString = (
  hexStr?: Address,
  start = 4,
  end = 3
): string => {
  if (hexStr)
    return `${hexStr.slice(0, start)}...${hexStr.slice(
      hexStr.length - end,
      hexStr.length
    )}`;
  else return "";
};
