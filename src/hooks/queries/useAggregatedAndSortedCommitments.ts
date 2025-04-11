import { useMemo } from "react";
import { CommitmentType } from "./useGetCommitmentsForCollateralToken";

export const useAggregatedAndSortedCommitments = (
  commitments: CommitmentType[] = []
): CommitmentType[] => {
  return useMemo(() => {
    const grouped: Record<string, CommitmentType[]> = {};

    for (const commitment of commitments) {
      const duration = commitment.maxDuration ?? "0";
      if (!grouped[duration]) grouped[duration] = [];
      grouped[duration].push(commitment);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(b) - Number(a)) // sort by duration descending
      .flatMap(([_, group]) =>
        group.sort((a, b) => {
          const loanA = BigInt(a.maxPrincipal || "0");
          const loanB = BigInt(b.maxPrincipal || "0");
          return loanB > loanA ? 1 : loanB < loanA ? -1 : 0;
        })
      );
  }, [commitments]);
};
