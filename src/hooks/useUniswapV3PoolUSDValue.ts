// useUniswapV3PoolUSDValue.ts
import { useReadContract, ContractType } from "./useReadContract";
import { useTokenUSDPrice } from "./useTokenUSDPrice";

// The Uniswap V3 pool address
const poolAddress = "0x120ffad35bb97a5baf9ab68f9dd7667864530245";

/**
 * Hook to estimate the total USD value held in a Uniswap V3 pool.
 *
 * Note: For a Uniswap V3 pool the on‑chain token balances (read via ERC‑20 balanceOf)
 * typically represent accrued fees and not the full liquidity (which is maintained
 * via concentrated liquidity positions off the pool contract).
 *
 * To compute the USD value, this hook:
 *  1. Reads token0 and token1 addresses from the pool contract.
 *  2. Reads the token balances (via ERC‑20 balanceOf) held by the pool.
 *  3. Multiplies each balance by its USD price (dummy values shown; replace with your oracle).
 *  4. Returns the aggregated value.
 */

// Minimal ABI for retrieving token0 and token1 from the Uniswap V3 pool contract
const poolMinimalAbi = [
  {
    "inputs": [],
    "name": "token0",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token1",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];


export const useUniswapV3PoolUSDValue = () => {
  // 1. Get token addresses from the pool contract
  const { data: token0Address, isLoading: token0AddrLoading, error: token0AddrError } = useReadContract(
    poolAddress,
    "token0",
    [],
    false,
    ContractType.UNIV3POOL,
  );

  console.log("token0Address", token0Address)

  const { data: token1Address, isLoading: token1AddrLoading, error: token1AddrError } = useReadContract(
    poolAddress,
    "token1",
    [],
    false,
    ContractType.UNIV3POOL,
  );

  console.log("token1Address", token1Address)

  const token0AddressLower = token0Address ? (token0Address as string).toLowerCase().replace("0x", "") : "";
  const token1AddressLower = token1Address ? (token1Address as string).toLowerCase().replace("0x", "") : "";

  console.log(token0AddressLower, token1AddressLower)

  // 2. Once we have the token addresses, get their ERC-20 balances held by the pool.
  // (These calls return the on-chain balance held by the pool contract.)
  const { data: token0Balance, isLoading: token0BalLoading, error: token0BalError } = useReadContract(
    `0x${token0AddressLower as string}`, // prefix "0x" to the address
    "balanceOf",
    [poolAddress],
    false,
    ContractType.ERC20
  );

  console.log("token0Balance", token0Balance)

  const { data: token1Balance, isLoading: token1BalLoading, error: token1BalError } = useReadContract(
    `0x${token1AddressLower as string}`, // prefix "0x" to the address
    "balanceOf",
    [poolAddress],
    false,
    ContractType.ERC20
  );

  console.log("token1Balance", token1Balance)

  // 3. Get USD prices for each token.
  // Replace these dummy values with your real price data (via an oracle or price API).
  const token0PriceUSD = useTokenUSDPrice(token0AddressLower) //0.0002; // e.g. $1 per token0 unit
  const token1PriceUSD = useTokenUSDPrice(token1AddressLower) //2500; // e.g. $1 per token1 unit

  // 4. Compute the total USD value
  let totalUSDValue = 0;
  if (token0Balance && token1Balance) {
    // Depending on the token’s decimals you may need to convert the raw balance.
    // Here we assume the balances are already adjusted or you do that conversion elsewhere.
    const value0 = parseFloat(token0Balance.toString()) * token0PriceUSD;
    const value1 = parseFloat(token1Balance.toString()) * token1PriceUSD;
    totalUSDValue = value0 + value1;
  }

  const isLoading = token0AddrLoading || token1AddrLoading || token0BalLoading || token1BalLoading;
  const error = token0AddrError || token1AddrError || token0BalError || token1BalError;

  console.log("totalUSDValue", totalUSDValue)
  return { totalUSDValue, isLoading, error };
};
