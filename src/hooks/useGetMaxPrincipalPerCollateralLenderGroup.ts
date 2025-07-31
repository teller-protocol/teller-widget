import { ContractType, useReadContract } from "./useReadContract";
import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { useLenderGroupsContractType } from "./useLenderGroupsContractType";

export const useGetMaxPrincipalPerCollateralLenderGroup = (
  commitment?: CommitmentType
) => {
  const isLenderGroup = commitment?.isLenderGroup;
  const lenderGroupsContractType = useLenderGroupsContractType();
  const { data: poolOracleRoute1 } = useReadContract<any[]>(
    commitment?.lenderAddress ?? "0x",
    "poolOracleRoutes",
    [0],
    !isLenderGroup || !commitment.lenderAddress,
    lenderGroupsContractType
  );

  const { data: poolOracleRoute2, isFetched: poolOracleRoute2Fetched } =
    useReadContract<any[]>(
      commitment?.lenderAddress ?? "0x",
      "poolOracleRoutes",
      [1],
      !isLenderGroup || !commitment.lenderAddress,
      lenderGroupsContractType
    );
  const { data: maxPrincipalPerCollateralLenderGroup } =
    useReadContract<bigint>(
      commitment?.lenderAddress ?? "0x",
      "getUniswapPriceRatioForPoolRoutes",
      [[poolOracleRoute1, ...(poolOracleRoute2 ? [poolOracleRoute2] : [])]],
      !isLenderGroup || !poolOracleRoute1 || !poolOracleRoute2Fetched,
      lenderGroupsContractType
    );
  const ajustedMaxPrincipalPerCollateralLenderGroup =
    maxPrincipalPerCollateralLenderGroup
      ? (BigInt(maxPrincipalPerCollateralLenderGroup) * 10000n) /
        BigInt(commitment?.collateralRatio ?? 1)
      : 0n;
  return ajustedMaxPrincipalPerCollateralLenderGroup;
};
