// Constants
const STANDARD_EXPANSION_FACTOR = BigInt("1000000000000000000"); // 10^18

/**
 * Calculates required collateral for LenderGroup mode
 * Uses the same logic as the smart contract: mulDiv with rounding up
 */
export function calculateLenderGroupRequiredCollateral(
  principalAmount: bigint,
  maxPrincipalPerCollateralAmount: bigint
): bigint {
  if (maxPrincipalPerCollateralAmount === 0n) {
    console.warn("maxPrincipalPerCollateralAmount for Lender Group is 0");
    return 0n;
  }

  const result =
    (principalAmount * STANDARD_EXPANSION_FACTOR) /
    maxPrincipalPerCollateralAmount;

  const remainder =
    (principalAmount * STANDARD_EXPANSION_FACTOR) %
    maxPrincipalPerCollateralAmount;
  if (remainder > 0n) {
    return result + 1n;
  }

  return result;
}
