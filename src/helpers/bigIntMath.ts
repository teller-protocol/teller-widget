export const bigIntMax = (...args: bigint[]) =>
  args.reduce((m, e) => (e > m ? e : m));
export const bigIntMin = (...args: bigint[]) =>
  args.reduce((m, e) => (e < m ? e : m));
export const abs = (x: bigint) => {
  return x < 0n ? -x : x;
};
export const bigIntPow = (base: bigint, exp: bigint): bigint => {
  let result = 1n;
  let b = base;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) result *= b;
    b *= b;
    e /= 2n;
  }
  return result;
};
