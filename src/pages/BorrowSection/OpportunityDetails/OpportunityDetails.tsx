import { useEffect, useMemo, useState } from "react";

import separatorWithCaret from "../../../assets/separator_with_caret.svg";
import BackButton from "../../../components/BackButton";
import DataField from "../../../components/DataField";
import TokenInput from "../../../components/TokenInput";
import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import { SUPPORTED_TOKEN_LOGOS } from "../../../constants/tokens";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import { convertSecondsToDays } from "../../../helpers/dateUtils";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../../BorrowSection/BorrowSectionContext";

import { useGetCommitmentMax } from "../../../hooks/useGetCommitmentMax";
import "./opportunityDetails.scss";

import { formatUnits, parseUnits } from "viem";

import { useIsNewBorrower } from "../../../hooks/queries/useIsNewBorrower";
import { useGetProtocolFee } from "../../../hooks/useGetProtocolFee";
import { AcceptCommitmentButton } from "./AcceptCommitmentButton";
import Button from "../../../components/Button";

const OpportunityDetails = () => {
  const { setCurrentStep, selectedOpportunity, selectedCollateralToken } =
    useGetBorrowSectionContext();
  const { isWhitelistedToken } = useGetGlobalPropsContext();
  const whitelistedToken = isWhitelistedToken(selectedCollateralToken?.address);

  const isWhitelistedTokenAndUserHasNoBalance =
    whitelistedToken && Number(selectedCollateralToken?.balance) === 0;

  const [collateralTokenValue, setCollateralTokenValue] =
    useState<TokenInputType>({
      token: selectedOpportunity.collateralToken,
      value: Number(
        Number(selectedCollateralToken?.balance) > 0
          ? selectedCollateralToken?.balance
          : 1
      ),
      valueBI:
        selectedCollateralToken?.balanceBigInt ?? 0n > BigInt(0)
          ? selectedCollateralToken?.balanceBigInt
          : BigInt(parseUnits("1", selectedCollateralToken?.decimals ?? 0)),
    });

  const {
    displayedPrincipal,
    isLoading,
    maxCollateral,
    maxLoanAmount,
    maxLoanAmountNumber,
  } = useGetCommitmentMax({
    collateralTokenDecimals: selectedCollateralToken?.decimals,
    commitment: selectedOpportunity,
    requestedCollateral: collateralTokenValue.valueBI,
    returnCalculatedLoanAmount: true,
  });

  useEffect(() => {
    if (isWhitelistedTokenAndUserHasNoBalance) {
      return;
    }

    setCollateralTokenValue((prev) => {
      if (prev.valueBI === maxCollateral) {
        return prev;
      }
      return {
        ...prev,
        valueBI: maxCollateral,
        value: Number(
          formatUnits(maxCollateral, selectedCollateralToken?.decimals ?? 0)
        ),
      };
    });
  }, [
    collateralTokenValue,
    isWhitelistedTokenAndUserHasNoBalance,
    maxCollateral,
    selectedCollateralToken?.decimals,
  ]);

  const { isNewBorrower } = useIsNewBorrower();

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
  const { referralFee } = useGetGlobalPropsContext();

  const totalFeePercent =
    protocolFeePercent +
    +(selectedOpportunity?.marketplace?.marketplaceFeePercent ?? 0) +
    (referralFee ?? 0);

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
          formatUnits(
            maxCollateral ?? 0n,
            selectedCollateralToken?.decimals ?? 0
          )
        )} ${selectedCollateralToken?.symbol}`}
        onChange={setCollateralTokenValue}
      />
      <div className="duration-info">
        <DataField label="Duration">
          {convertSecondsToDays(Number(selectedOpportunity?.maxDuration))} days
        </DataField>
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
              selectedOpportunity?.principalToken?.decimals ?? 0
            )
          ),
          valueBI: displayedPrincipal,
        }}
        label="Borrow"
        imageUrl={
          SUPPORTED_TOKEN_LOGOS[
            selectedOpportunity.principalToken?.symbol ?? ""
          ]
        }
        readonly
      />
      <div className="section-title fee-details">
        Interest: {numberWithCommasAndDecimals(payPerLoan)}{" "}
        {selectedOpportunity.principalToken?.symbol} • Fees:{" "}
        {numberWithCommasAndDecimals(totalFees)}{" "}
        {selectedOpportunity.principalToken?.symbol}
      </div>

      {isNewBorrower ? (
        <Button
          label="Accept terms"
          onClick={() => setCurrentStep(BorrowSectionSteps.ACCEPT_TERMS)}
          isFullWidth
        />
      ) : (
        <AcceptCommitmentButton
          collateralToken={collateralTokenValue}
          commitment={selectedOpportunity}
          principalToken={maxLoanAmount}
        />
      )}
    </div>
  );
};

export default OpportunityDetails;
