export const parseBigInt = (value: string | number | bigint): bigint =>
  BigInt(parseInt(value.toString()));
