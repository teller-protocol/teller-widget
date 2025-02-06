import { useEffect, useMemo, useState } from "react";

import separatorWithCaret from "../../../assets/separator_with_caret.svg";
import BackButton from "../../../components/BackButton";
import DataField from "../../../components/DataField";
import TokenInput from "../../../components/TokenInput";
import Tooltip from "../../../components/Tooltip";
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
  const [staticMaxCollateral, setStaticMaxCollateral] = useState<bigint>();

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

    if (!staticMaxCollateral && maxCollateral) {
      setStaticMaxCollateral(maxCollateral);
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
    staticMaxCollateral,
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
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Deposit
            <Tooltip
              description={`Deposit $${selectedCollateralToken?.symbol} to borrow $${selectedOpportunity?.principalToken?.symbol} for ${convertSecondsToDays(Number(selectedOpportunity?.maxDuration))} days—extend anytime via rollover.`}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="tooltip-svg" style={{ position: 'relative', top: '1px' }}>
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4" strokeWidth="2"/>
                  <circle cx="12" cy="8" r="1"/>
                </svg>
              }
            />
          </div>
        }
        maxAmount={Number(selectedCollateralToken?.balance ?? 0)}
        imageUrl={selectedCollateralToken?.logo || ""}
        sublabelUpper={`Max: ${numberWithCommasAndDecimals(
          formatUnits(
            staticMaxCollateral ?? 0n,
            selectedCollateralToken?.decimals ?? 0
          )
        )} ${selectedCollateralToken?.symbol}`}
        onChange={setCollateralTokenValue}
      />
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
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Borrow
            <Tooltip
              description={`Borrow $${selectedOpportunity?.principalToken?.symbol} for ${convertSecondsToDays(Number(selectedOpportunity?.maxDuration))} days—extend anytime via rollover.`}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="tooltip-svg" style={{ position: 'relative', top: '1px' }}>
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4" strokeWidth="2"/>
                  <circle cx="12" cy="8" r="1"/>
                </svg>
              }
            />
          </div>
        }
        imageUrl={
          SUPPORTED_TOKEN_LOGOS[
            selectedOpportunity.principalToken?.symbol ?? ""
          ]
        }
        sublabelUpper={
          <span>
            Duration: {convertSecondsToDays(Number(selectedOpportunity?.maxDuration))} days • Rollover: {' '}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              overflow="visible"
              x="0px"
              y="0px"
              width="12"
              height="12"
              viewBox="0 0 50 50"
              className="rollover-svg"
            >
              <g transform="translate(0, 9)">
                <path
                  className="outer"
                  d="M 25 2 C 12.317 2 2 12.317 2 25 C 2 37.683 12.317 48 25 48 C 37.683 48 48 37.683 48 25 C 48 20.44 46.660281 16.189328 44.363281 12.611328 L 42.994141 14.228516 C 44.889141 17.382516 46 21.06 46 25 C 46 36.579 36.579 46 25 46 C 13.421 46 4 36.579 4 25 C 4 13.421 13.421 4 25 4 C 30.443 4 35.393906 6.0997656 39.128906 9.5097656 L 40.4375 7.9648438 C 36.3525 4.2598437 30.935 2 25 2 z"
                ></path>
                <path
                  className="check"
                  d="M 43.236328 7.7539062 L 23.914062 30.554688 L 15.78125 22.96875 L 14.417969 24.431641 L 24.083984 33.447266 L 44.763672 9.046875 L 43.236328 7.7539062 z"
                ></path>
              </g>
            </svg>

          </span>
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
