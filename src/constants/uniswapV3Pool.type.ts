export type UniswapV3Pool = {
  id: string;
  feeTier: string;
  totalValueLockedUSD: string;
  token0: {
    id: string;
    decimals: number;
  };
  token1: {
    id: string;
    decimals: number;
  };
};
