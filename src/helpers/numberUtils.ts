const formatNum = (
  num: number,
  decimals: number,
  numCommas: number,
  keepZeros: boolean = true
): string => {
  let res = (num / 10 ** (3 * numCommas))
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))\./g, ",");
  if (!keepZeros && numCommas < 2) {
    res = Number(res).toLocaleString();
  }
  return res;
};

export const numberWithCommasAndDecimals = (
  x: number | string | undefined,
  decimals: number = 2,
  keepZeros: boolean = true
) => {
  if (x === "Infinite") return "Infinite";
  const number = Number(x);
  if (isNaN(number)) return keepZeros ? (0).toFixed(decimals) : "0";

  if (number < 1e3) return formatNum(number, decimals, 0, keepZeros);
  if (number >= 1e3 && number < 1e6)
    return formatNum(number, decimals, 1, keepZeros) + "K";
  if (number >= 1e6 && number < 1e9)
    return formatNum(number, decimals, 2, keepZeros) + "M";
  if (number >= 1e9) return formatNum(number, decimals, 3, keepZeros) + "B";
  return number.toString();
};
