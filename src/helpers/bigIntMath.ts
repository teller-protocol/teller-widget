export const bigIntMax = (...args: bigint[]) =>
  args.reduce((m, e) => (e > m ? e : m));
export const bigIntMin = (...args: bigint[]) =>
  args.reduce((m, e) => (e < m ? e : m));
export const abs = (x: bigint) => {
  return x < 0n ? -x : x;
};
