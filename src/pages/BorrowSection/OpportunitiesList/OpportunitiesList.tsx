import React, { useEffect, useMemo, useState } from "react";
import Button from "../../../components/Button";
import TokenDropdown from "../../../components/TokenDropdown";
import {
  CommitmentType,
  useGetCommitmentsForCollateralToken,
} from "../../../hooks/queries/useGetCommitmentsForCollateralToken";
import {
  useGetCommitmentsForErc20TokensByPrincipalToken,
} from "../../../hooks/queries/useGetCommitmentsForErc20Tokens";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";

import "./opportunitiesList.scss";

import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import caret from "../../../assets/right-caret.svg";
import DataPill from "../../../components/DataPill";
import Loader from "../../../components/Loader";
import { SUPPORTED_TOKEN_LOGOS } from "../../../constants/tokens";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useGetCommitmentsForCollateralTokensFromLiquidityPools } from "../../../hooks/queries/useGetCommitmentsForCollateralTokensFromLiquidityPools";
import { useGetAPRForLiquidityPools } from "../../../hooks/useGetAPRForLiquidityPools";
import { useGetCommitmentMax } from "../../../hooks/useGetCommitmentMax";
import { useLiquidityPoolsCommitmentMax } from "../../../hooks/useLiquidityPoolsCommitmentMax";
import { useGetTokenMetadata } from "../../../hooks/useGetTokenMetadata";
import { BORROW_TOKEN_TYPE_ENUM } from "../CollateralTokenList/CollateralTokenList";

interface OpportunityListItemProps {
  opportunity: CommitmentType;
}

interface OpportunityListDataItemProps {
  label: string;
  value: React.ReactNode;
}

const OpportunityListDataItem: React.FC<OpportunityListDataItemProps> = ({
  label,
  value,
}) => (
  <div className="opportunity-list-item-data">
    <div className="opportunity-list-item-data-label section-sub-title">
      {label}
    </div>
    <div className="opportunity-list-item-data-value">{value}</div>
  </div>
);

const OpportunityListItem: React.FC<OpportunityListItemProps> = ({
  opportunity,
}) => {
  const {
    setCurrentStep,
    setSelectedOpportunity,
    selectedCollateralToken,
    selectedPrincipalErc20Token,
    setMaxCollateral,
    tokensWithCommitments,
    tokenTypeListView,
  } = useGetBorrowSectionContext();
  const { userTokens, isWhitelistedToken } = useGetGlobalPropsContext();

  const { tokenMetadata: principalTokenMetadata } = useGetTokenMetadata(
    opportunity.principalToken?.address ?? ""
  );

  const isLiquidityPool = opportunity.isLenderGroup;
  const isStableView = tokenTypeListView === BORROW_TOKEN_TYPE_ENUM.STABLE;

  const matchingCollateralToken = !isStableView 
    ? tokensWithCommitments.find(token => 
        token.address.toLowerCase() === opportunity.collateralToken?.address?.toLowerCase()
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
  });

  const lenderGroupCommitmentMax = useLiquidityPoolsCommitmentMax({
    lenderGroupCommitment: opportunity,
    collateralAmount: collateralAmount,
    skip: !isLiquidityPool,
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
    token: userTokens.find(
      (token) => token.address === opportunity.collateralToken?.address
    )?.logo,
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

  return (
    <div className="opportunity-list-item" onClick={handleOnOpportunityClick}>
      <div className="paragraph opportunity-list-item-header">
        Deposit{" "}
        <DataPill
          label={displayCollateralAmountData.formattedAmount}
          logo={displayCollateralAmountData.token}
        />{" "}
        to borrow{" "}
        <DataPill
          label={displayLoanAmountData.formattedAmount}
          logo={displayLoanAmountData.token}
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
          </>
        )}
      </div>
    </div>
  );
};

const OpportunitiesList: React.FC = () => {
  const { address: userAddress } = useAccount();

  const {
    tokenTypeListView,
    selectedCollateralToken,
    selectedPrincipalErc20Token,
    tokensWithCommitments,
    principalErc20Tokens,
  } = useGetBorrowSectionContext();
  const isStableView = tokenTypeListView === BORROW_TOKEN_TYPE_ENUM.STABLE;

  const {
    data: lcfaCommitments,
    isLoading: isLcfaLoading,
  } = useGetCommitmentsForCollateralToken(
    selectedCollateralToken?.address,
    userAddress
  );

  const {
    data: lenderGroupsCommitments,
    isLoading: isLenderGroupsLoading,
  } = useGetCommitmentsForCollateralTokensFromLiquidityPools(
    selectedCollateralToken?.address
  );

  const {
    erc20sWithCommitments: erc20sWithCommitments,
    isLoading: isErc20Loading,
  } = useGetCommitmentsForErc20TokensByPrincipalToken(selectedPrincipalErc20Token?.address);

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
        {isStableView ? (
          selectedCollateralToken && (
            <TokenDropdown
              tokens={tokensWithCommitments}
              selectedToken={selectedCollateralToken}
            />
          )
        ) : (
          selectedPrincipalErc20Token && (
            <TokenDropdown
              tokens={principalErc20Tokens}
              selectedToken={selectedPrincipalErc20Token}
            />
          )
        )}
      </div>
      {data && (
        <div className="opportunities-list-body">
          <div className="paragraph opportunities-sub-title">
            <div className="opp-pill-row">
              My opportunities
              {!isStableView && (
                <span style={{fontSize: "11px", padding: "2px 5px !important",}}>
                  <DataPill
                    label={"76% APY"}
                    logo={"https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"}
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
                      Deploy ${isStableView ? selectedCollateralToken?.symbol : selectedPrincipalErc20Token?.symbol} pool
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
              data.commitments.map((commitment) => (
                <OpportunityListItem
                  opportunity={commitment}
                  key={commitment.id}
                />
              ))
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
