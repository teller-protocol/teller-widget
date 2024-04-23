import { useEffect, useMemo, useState } from "react";
import { lcfAlphaAddressMap } from "../constants/lcfAlphaAddresses";
import { CommitmentType } from "./queries/useGetCommitmentsForCollateralToken";
import { useChainId } from "wagmi";
import { SupportedContractsEnum, useReadContract } from "./useReadContract";
import { bigIntMin } from "../helpers/bigIntMath";

export const useGetMaxPrincipalPerCollateralFromLCFAlpha = (
  commitment?: CommitmentType
) => {
  const chainId = useChainId();

  const [maxPrincipalPerCollateral, setMaxPrincipalPerCollateral] = useState<
    bigint | string | undefined
  >();

  const lcfAlphaAddress = lcfAlphaAddressMap[chainId];
  const isCommitmentFromLCFAlpha =
    lcfAlphaAddress === commitment?.forwarderAddress;

  const commitmentRoutes = useReadContract(
    SupportedContractsEnum.LenderCommitmentForwarderAlpha,
    "getAllCommitmentUniswapPoolRoutes",
    [commitment?.id],
    !commitment?.id && !isCommitmentFromLCFAlpha
  );

  const priceRatio = useReadContract(
    SupportedContractsEnum.LenderCommitmentForwarderAlpha,
    "getUniswapPriceRatioForPoolRoutes",
    [commitmentRoutes.data],
    !commitment?.id &&
      !isCommitmentFromLCFAlpha &&
      commitmentRoutes.data?.[0].length > 0
  );
  const ltvRatio = useReadContract(
    SupportedContractsEnum.LenderCommitmentForwarderAlpha,
    "getCommitmentPoolOracleLtvRatio",
    [commitment?.id],
    !isCommitmentFromLCFAlpha && !commitment?.id
  );

  useEffect(() => {
    if (
      !commitment?.id ||
      (isCommitmentFromLCFAlpha && (!priceRatio.data || !ltvRatio.data))
    )
      return;
    const newMaxPrincipalPerCollateral =
      (BigInt(priceRatio.data ?? 0) * BigInt(ltvRatio.data ?? 0)) /
      BigInt(10000);

    const maxPrincipalPerCollateralAmount = BigInt(
      commitment?.maxPrincipalPerCollateralAmount ?? 0
    );

    setMaxPrincipalPerCollateral(
      isCommitmentFromLCFAlpha && newMaxPrincipalPerCollateral > 0
        ? bigIntMin(
            maxPrincipalPerCollateralAmount,
            newMaxPrincipalPerCollateral
          )
        : maxPrincipalPerCollateralAmount
    );
  }, [
    priceRatio.data,
    ltvRatio.data,
    commitment?.maxPrincipalPerCollateralAmount,
    isCommitmentFromLCFAlpha,
    commitment?.id,
    commitment,
    commitmentRoutes?.data,
    commitmentRoutes,
  ]);

  return useMemo(
    () => ({
      maxPrincipalPerCollateral,
      isCommitmentFromLCFAlpha,
      lcfAlphaAddress,
    }),
    [isCommitmentFromLCFAlpha, lcfAlphaAddress, maxPrincipalPerCollateral]
  );
};
