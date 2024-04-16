import { memo, useEffect, useMemo, useState } from "react";
import BackButton from "../../components/BackButton";
import TokenInput from "../../components/TokenInput";
import { TokenInputType } from "../../components/TokenInput/TokenInput";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSection/BorrowSectionContext";
import { useGetUserTokens } from "../../hooks/useGetUserTokens";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import DataField from "../../components/DataField";
import { convertSecondsToDays } from "../../helpers/dateUtils";
import separatorWithCaret from "../../assets/separator_with_caret.svg";

import "./opportunityDetails.scss";
import { useCommitmentMax } from "../../hooks/useGetCommitmentMax";
import { formatUnits } from "viem";
import { SUPPORTED_TOKEN_LOGOS } from "../../constants/tokens";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";

const OpportunityDetails = () => {
  const { setCurrentStep, selectedOpportunity, selectedCollateralToken } =
    useGetBorrowSectionContext();
  const { userTokens } = useGetUserTokens();

  console.log(
    "TCL ~ file: OpportunityDetails.tsx:23 ~ OpportunityDetails ~ selectedOpportunity:",
    selectedOpportunity
  );

  const [collateralTokenValue, setCollataralTokenValue] =
    useState<TokenInputType>({
      token: selectedOpportunity.collateralToken,
      value: Number(selectedCollateralToken?.balance ?? 0),
      valueBI: selectedCollateralToken?.balanceBigInt ?? BigInt(0),
    });

  const {
    displayedPrincipal,
    isLoading,
    maxCollateral,
    maxLoanAmount,
    maxLoanAmountNumber,
  } = useCommitmentMax({
    collateralTokenDecimals: selectedCollateralToken?.decimals,
    commitment: selectedOpportunity,
    requestedCollateral: collateralTokenValue.valueBI,
  });

  let extensionCount = 0;
  let maxExtensionInDays = 0;

  if (maxLoanAmount && maxLoanAmount > 0) {
    extensionCount = Number(
      BigInt(selectedOpportunity?.committedAmount) / BigInt(maxLoanAmount)
    );

    maxExtensionInDays =
      convertSecondsToDays(
        extensionCount * +(selectedOpportunity?.maxDuration ?? 0)
      ) ?? 0;
  }

  const { protocolFeePercent } = useGetProtocolFee();

  const totalFeePercent =
    protocolFeePercent +
    +selectedOpportunity?.marketplace.marketplaceFeePercent;

  const totalFees = (maxLoanAmountNumber * totalFeePercent) / 10000;

  const payPerLoan = useMemo(
    () =>
      numberWithCommasAndDecimals(
        (((+(selectedOpportunity?.minAPY ?? 0) / 10000) * maxLoanAmountNumber) /
          365) *
          (convertSecondsToDays(
            Number(selectedOpportunity?.maxDuration ?? 0)
          ) ?? 0),
        3
      ),
    [selectedOpportunity, maxLoanAmountNumber]
  );
  return (
    <div className="opportunity-details">
      <BackButton
        onClick={() => setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY)}
      />
      <TokenInput
        tokenValue={collateralTokenValue}
        label="Deposit collateral"
        maxAmount={Number(selectedCollateralToken?.balance ?? 0)}
        imageUrl={selectedCollateralToken?.logo || ""}
        sublabel={`Max collateral: ${numberWithCommasAndDecimals(
          selectedCollateralToken?.balance
        )} ${selectedCollateralToken?.symbol}`}
        onChange={setCollataralTokenValue}
      />
      <div className="duration-info">
        <DataField
          label="Duration"
          value={`${convertSecondsToDays(
            Number(selectedOpportunity?.maxDuration)
          )} days`}
        />
        {extensionCount > 0 && (
          <div className="section-sub-title">
            Max extension: {maxExtensionInDays} days
          </div>
        )}
      </div>
      <img src={separatorWithCaret} className="separator" />
      <TokenInput
        tokenValue={{
          token: selectedOpportunity?.principalToken,
          value: Number(
            formatUnits(
              displayedPrincipal,
              selectedOpportunity?.principalToken?.decimals
            )
          ),
          valueBI: displayedPrincipal,
        }}
        label="Borrow"
        imageUrl={
          SUPPORTED_TOKEN_LOGOS[selectedOpportunity.principalToken?.symbol]
        }
        readonly
      />
      <div className="section-title fee-details">
        Interest: {numberWithCommasAndDecimals(payPerLoan)}{" "}
        {selectedOpportunity.principalToken?.symbol} • Fees:{" "}
        {numberWithCommasAndDecimals(totalFees)}{" "}
        {selectedOpportunity.principalToken?.symbol}
      </div>
    </div>
  );
};

export default OpportunityDetails;
