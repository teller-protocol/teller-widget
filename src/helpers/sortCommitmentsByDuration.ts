import { CommitmentType } from "../hooks/queries/useGetCommitmentsForCollateralToken";

export const sortCommitmentsByDuration = (
  commitments: CommitmentType[] = []
): CommitmentType[] => {
  const thirtyDayCommitments: CommitmentType[] = [];
  const otherCommitments: CommitmentType[] = [];

  for (const commitment of commitments) {
    const duration = Number(commitment.maxDuration ?? "0");
    if (duration === 86400) {
      thirtyDayCommitments.push(commitment);
    } else {
      otherCommitments.push(commitment);
    }
  }

  return [...thirtyDayCommitments, ...otherCommitments];
};
