import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "./useReadContract";

export const useGetMaxPrincipalPerCollateralLenderGroup = (
  commitment?: CommitmentType
) => {
  const isLenderGroup = commitment?.isLenderGroup;
  const { data: poolOracleRoute1 } = useReadContract<any[]>(
    commitment?.lenderAddress ?? "0x",
    "poolOracleRoutes",
    [0],
    !isLenderGroup || !commitment.lenderAddress,
    commitment?.isV2 ? ContractType.LenderGroupsV2 : ContractType.LenderGroups
  );

  const { data: poolOracleRoute2, isFetched: poolOracleRoute2Fetched } =
    useReadContract<any[]>(
      commitment?.lenderAddress ?? "0x",
      "poolOracleRoutes",
      [1],
      !isLenderGroup || !commitment.lenderAddress,
      commitment?.isV2 ? ContractType.LenderGroupsV2 : ContractType.LenderGroups
    );
  const { data: maxPrincipalPerCollateralLenderGroup } =
    useReadContract<bigint>(
      SupportedContractsEnum.UniswapPricingHelper,
      "getUniswapPriceRatioForPoolRoutes",
      [[poolOracleRoute1, ...(poolOracleRoute2 ? [poolOracleRoute2] : [])]],
      !isLenderGroup || !poolOracleRoute1 || !poolOracleRoute2Fetched
    );
  const ajustedMaxPrincipalPerCollateralLenderGroup =
    maxPrincipalPerCollateralLenderGroup
      ? (BigInt(maxPrincipalPerCollateralLenderGroup) * 10000n) /
        BigInt(commitment?.collateralRatio ?? 1)
      : 0n;
  return ajustedMaxPrincipalPerCollateralLenderGroup;
};
