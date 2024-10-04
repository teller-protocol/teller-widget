export const parseBigInt = (value: string | number | bigint): bigint =>
  BigInt(value.toString());
