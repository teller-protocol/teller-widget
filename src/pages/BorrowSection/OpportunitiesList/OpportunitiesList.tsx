import React, { useEffect, useMemo, useState } from "react";
import Button from "../../../components/Button";
import TokenDropdown from "../../../components/TokenDropdown";
import {
  CommitmentType,
  useGetCommitmentsForCollateralToken,
} from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import { useGetCommitmentsForErc20Tokens } from "../../../hooks/useGetCommitmentsForErc20Tokens";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";

import "./opportunitiesList.scss";

import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import caret from "../../../assets/right-caret.svg";
import DataPill from "../../../components/DataPill";
import Loader from "../../../components/Loader";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useGetCommitmentsForCollateralTokensFromLiquidityPools } from "../../../hooks/queries/useGetCommitmentsForCollateralTokensFromLiquidityPools";
import { useGetAPRForLiquidityPools } from "../../../hooks/useGetAPRForLiquidityPools";
import { useGetCommitmentMax } from "../../../hooks/useGetCommitmentMax";
import { useGetProtocolFee } from "../../../hooks/useGetProtocolFee";
import { useGetTokenMetadata } from "../../../hooks/useGetTokenMetadata";
import { useLiquidityPoolsCommitmentMax } from "../../../hooks/useLiquidityPoolsCommitmentMax";
import { AddressStringType } from "../../../types/addressStringType";
import { BORROW_TOKEN_TYPE_ENUM } from "../CollateralTokenList/CollateralTokenList";
import { useGetTokenImageFromTokenList } from "../../../hooks/useGetTokenImageFromTokenList";

interface OpportunityListItemProps {
  opportunity: CommitmentType;
}

interface OpportunityListDataItemProps {
  label: string;
  value: React.ReactNode;
  valueTextColor?: string;
}

const OpportunityListDataItem: React.FC<OpportunityListDataItemProps> = ({
  label,
  value,
  valueTextColor,
}) => (
  <div className="opportunity-list-item-data">
    <div className="opportunity-list-item-data-label section-sub-title">
      {label}
    </div>
    <div
      className="opportunity-list-item-data-value"
      style={{ color: valueTextColor || "inherit" }}
    >
      {value}
    </div>
  </div>
);

const OpportunityListItem: React.FC<OpportunityListItemProps> = ({
  opportunity,
}) => {
  const {
    setCurrentStep,
    setSelectedOpportunity,
    selectedCollateralToken,
    setMaxCollateral,
    tokensWithCommitments,
    selectedErc20Apy,
  } = useGetBorrowSectionContext();
  const { userTokens, isWhitelistedToken } = useGetGlobalPropsContext();
  const { address: userAddress } = useAccount();

  const { data: collateralTokenBalance } = useBalance({
    address: userAddress,
    token: opportunity.collateralToken?.address,
  });

  const { isStrategiesSection } = useGetGlobalPropsContext();
  const isLiquidityPool = opportunity.isLenderGroup;
  const isStableView = !isStrategiesSection;

  const tokenIsWhitelistedAndBalanceIs0 =
    (isStableView
      ? isWhitelistedToken(opportunity.collateralToken?.address)
      : true) &&
    (!collateralTokenBalance || collateralTokenBalance.value === 0n);

  const { tokenMetadata: principalTokenMetadata } = useGetTokenMetadata(
    opportunity.principalToken?.address ?? ""
  );

  const getTokenImageFromTokenList = useGetTokenImageFromTokenList();

  const matchingCollateralToken = !isStableView
    ? tokensWithCommitments.find(
        (token) =>
          token.address.toLowerCase() ===
          opportunity.collateralToken?.address?.toLowerCase()
      )
    : selectedCollateralToken;

  const defaultAmount = isWhitelistedToken(opportunity.collateralToken?.address)
    ? BigInt(parseUnits("1", opportunity.collateralToken?.decimals ?? 0))
    : BigInt(0);

  const [collateralAmount, setCollateralAmount] = useState<bigint | undefined>(
    (matchingCollateralToken?.balanceBigInt ?? 0) > 0
      ? matchingCollateralToken?.balanceBigInt
      : defaultAmount
  );
  const lcfaCommitmentMax = useGetCommitmentMax({
    commitment: opportunity,
    requestedCollateral: collateralAmount,
    collateralTokenDecimals: opportunity.collateralToken?.decimals,
    isRollover: true,
  });

  const lenderGroupCommitmentMax = useLiquidityPoolsCommitmentMax({
    lenderGroupCommitment: opportunity as any,
    collateralAmount: collateralAmount,
    skip: !isLiquidityPool,
    tokenIsWhitelistedAndBalanceIs0,
  });
  
  const commitmentMax = isLiquidityPool
    ? lenderGroupCommitmentMax
    : lcfaCommitmentMax;
  useEffect(() => {
    setMaxCollateral(commitmentMax.maxCollateral);
  }, [commitmentMax.maxCollateral, setMaxCollateral]);

  // TODO: ADD SOCIAL FI CONDITIONAL
  useEffect(() => {
    commitmentMax.maxCollateral > 0 &&
      setCollateralAmount(commitmentMax.maxCollateral);
  }, [commitmentMax.maxCollateral]);

  const displayCollateralAmountData = {
    formattedAmount: numberWithCommasAndDecimals(
      Number(
        formatUnits(
          commitmentMax.maxCollateral,
          opportunity.collateralToken?.decimals ?? 0
        )
      ).toFixed(2)
    ),
    token:
      userTokens.find(
        (token) =>
          token.address?.toLowerCase() ===
          opportunity.collateralToken?.address?.toLowerCase()
      )?.logo ??
      getTokenImageFromTokenList(opportunity.collateralToken?.address ?? "") ??
      "",
  };

  const displayLoanAmountData = {
    formattedAmount: numberWithCommasAndDecimals(
      Number(
        formatUnits(
          commitmentMax.maxLoanAmount,
          opportunity.principalToken?.decimals ?? 0
        )
      ).toFixed(2)
    ),
    token: principalTokenMetadata?.logo,
  };

  const handleOnOpportunityClick = () => {
    setSelectedOpportunity(opportunity);
    setCurrentStep(BorrowSectionSteps.OPPORTUNITY_DETAILS);
  };

  const { data: liquidityPoolApr, isLoading: aprLoading = false } =
    useGetAPRForLiquidityPools(
      opportunity.lenderAddress ?? "0x",
      commitmentMax.maxLoanAmount.toString(),
      !isLiquidityPool
    );

  const apr = isLiquidityPool ? liquidityPoolApr : opportunity.minAPY;

  const { protocolFeePercent } = useGetProtocolFee();
  const { referralFee } = useGetGlobalPropsContext();

  const totalFeePercent =
    protocolFeePercent +
    +(opportunity?.marketplace?.marketplaceFeePercent ?? 0) +
    (referralFee ?? 0);

  return (
    <div className="opportunity-list-item" onClick={handleOnOpportunityClick}>
      <div className="paragraph opportunity-list-item-header">
        Deposit{" "}
        <DataPill
          label={displayCollateralAmountData.formattedAmount}
          logo={displayCollateralAmountData.token}
        />{" "}
        borrow{" "}
        <DataPill
          label={displayLoanAmountData.formattedAmount}
          logo={displayLoanAmountData.token ?? ""}
        />
        <img src={caret} />
      </div>
      <div className="opportunity-list-item-body">
        {aprLoading ? (
          <Loader isSkeleton height={16} />
        ) : (
          <>
            <OpportunityListDataItem
              label="Interest"
              value={`${(
                (Number(apr) / 100) *
                (Number(opportunity.maxDuration) / 86400 / 365)
              ).toFixed(2)} %`}
            />
            <OpportunityListDataItem
              label="Duration"
              value={`${Number(opportunity.maxDuration) / 86400} days`}
            />
            {!isStableView && (
              <OpportunityListDataItem
                label="Est. loan to uni ROI:"
                value={
                  parseFloat(selectedErc20Apy) -
                    (apr / 100 +
                      (totalFeePercent / 100) *
                        (365 / (Number(opportunity.maxDuration) / 86400))) <
                  0
                    ? "-"
                    : `+ ${(
                        parseFloat(selectedErc20Apy) -
                        (apr / 100 +
                          (totalFeePercent / 100) *
                            (365 / (Number(opportunity.maxDuration) / 86400)))
                      ).toFixed(2)} %`
                }
                valueTextColor={"#3D8974"}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const OpportunitiesList: React.FC = () => {
  const { address: userAddress } = useAccount();

  const {
    selectedCollateralToken,
    selectedPrincipalErc20Token,
    tokensWithCommitments,
    principalErc20Tokens,
    selectedErc20Apy,
  } = useGetBorrowSectionContext();
  const { isStrategiesSection } = useGetGlobalPropsContext();
  const isStableView = !isStrategiesSection;

  const { data: lcfaCommitments, isLoading: isLcfaLoading } =
    useGetCommitmentsForCollateralToken(
      selectedCollateralToken?.address,
      userAddress
    );

  const { data: lenderGroupsCommitments, isLoading: isLenderGroupsLoading } =
    useGetCommitmentsForCollateralTokensFromLiquidityPools(
      selectedCollateralToken?.address as AddressStringType
    );

  const {
    isLoading: isErc20Loading,
    getCommitmentsForErc20TokensByPrincipalToken,
  } = useGetCommitmentsForErc20Tokens();

  const erc20sWithCommitments = getCommitmentsForErc20TokensByPrincipalToken(
    selectedPrincipalErc20Token?.address
  );

  const data = useMemo(() => {
    if (isStableView) {
      if (lcfaCommitments && lenderGroupsCommitments) {
        return {
          commitments: [
            ...lcfaCommitments.commitments,
            ...lenderGroupsCommitments,
          ],
        };
      }
      return { commitments: [] };
    } else {
      return {
        commitments: erc20sWithCommitments || [],
      };
    }
  }, [
    isStableView,
    lcfaCommitments,
    lenderGroupsCommitments,
    erc20sWithCommitments,
  ]);

  const isLoading = isStableView
    ? isLcfaLoading || isLenderGroupsLoading
    : isErc20Loading;

  return (
    <div className="opportunities-list">
      <div className="opportunities-list-header">
        {isStableView
          ? selectedCollateralToken && (
              <TokenDropdown
                tokens={tokensWithCommitments}
                selectedToken={selectedCollateralToken}
              />
            )
          : selectedPrincipalErc20Token && (
              <TokenDropdown
                tokens={principalErc20Tokens}
                selectedToken={selectedPrincipalErc20Token}
              />
            )}
      </div>
      {data && (
        <div className="opportunities-list-body">
          <div className="paragraph opportunities-sub-title">
            <div className="opp-pill-row">
              {!isStableView && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 5px !important",
                    marginLeft: "auto",
                  }}
                >
                  <DataPill
                    label={`${selectedErc20Apy}% APY`}
                    logo={
                      "https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"
                    }
                  />
                </span>
              )}
            </div>
          </div>
          <>
            {isLoading ? (
              <Loader />
            ) : data.commitments.length === 0 ? (
              <div
                className="empty-opportunities"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                }}
              >
                <div className="section-title" style={{ marginBottom: "1rem" }}>
                  No liquidity found &nbsp; 👀
                </div>
                <Button
                  label={
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Deploy $
                      {isStableView
                        ? selectedCollateralToken?.symbol
                        : selectedPrincipalErc20Token?.symbol}{" "}
                      pool
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </span>
                  }
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      "https://app.teller.org/lend",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                />
              </div>
            ) : (
              data.commitments.map((commitment, index) => (
                <OpportunityListItem opportunity={commitment} key={index} />
              ))
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
