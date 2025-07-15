import { ALL_USDC_ADDRESSES } from "../constants/tokens";
import { CommitmentType } from "../hooks/queries/useGetCommitmentsForCollateralToken";

export const sortCommitments = (
  commitments: CommitmentType[] = []
): CommitmentType[] => {
  return commitments.slice().sort((a, b) => {
    const isUSDC = (c: CommitmentType) =>
      ALL_USDC_ADDRESSES.includes(
        (c.principalTokenAddress || "").toLowerCase()
      );
    const is30Day = (c: CommitmentType) =>
      Number(c.maxDuration ?? "0") === 2592000;

    const getPriority = (c: CommitmentType) => {
      const usdc = isUSDC(c);
      const d30 = is30Day(c);
      if (usdc && d30) return 0;
      if (usdc && !d30) return 1;
      if (!usdc && d30) return 2;
      return 3;
    };

    return getPriority(a) - getPriority(b);
  });
};
