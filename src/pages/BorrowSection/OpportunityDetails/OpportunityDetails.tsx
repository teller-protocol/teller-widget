import { useEffect, useMemo, useState } from "react";

import separatorWithCaret from "../../../assets/separator_with_caret.svg";
import BackButton from "../../../components/BackButton";
import DataPill from "../../../components/DataPill";
import TokenInput from "../../../components/TokenInput";
import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import Tooltip from "../../../components/Tooltip";
import { normalizeChainName } from "../../../constants/chains";
import {
  STRATEGY_ACTION_ENUM,
  useGetGlobalPropsContext,
} from "../../../contexts/GlobalPropsContext";
import { convertSecondsToDays } from "../../../helpers/dateUtils";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { useChainData } from "../../../hooks/useChainData";
import { useGetTokenMetadata } from "../../../hooks/useGetTokenMetadata";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../../BorrowSection/BorrowSectionContext";

import { useGetCommitmentMax } from "../../../hooks/useGetCommitmentMax";
import "./opportunityDetails.scss";

import { formatUnits, parseUnits } from "viem";

import { useAccount, useBalance } from "wagmi";
import Button from "../../../components/Button";
import TransactionButton from "../../../components/TransactionButton";
import { useIsNewBorrower } from "../../../hooks/queries/useIsNewBorrower";
import { useBorrowFromPool } from "../../../hooks/useBorrowFromPool";
import { useContracts } from "../../../hooks/useContracts";
import { useGetProtocolFee } from "../../../hooks/useGetProtocolFee";
import { useLiquidityPoolsCommitmentMax } from "../../../hooks/useLiquidityPoolsCommitmentMax";
import { AcceptCommitmentButton } from "./AcceptCommitmentButton";
import { BorrowSwapButton } from "./BorrowSwapButton";

import Loader from "../../../components/Loader/Loader";
import { useGetBorrowSwapData } from "../../../hooks/useGetBorrowSwapData";
import { StrategiesSelect } from "../CollateralTokenList/CollateralTokenList";

const OpportunityDetails = () => {
  const {
    setCurrentStep,
    selectedOpportunity,
    selectedCollateralToken,
    selectedPrincipalErc20Token,
    setSuccessLoanHash,
    setSuccessfulLoanParams,
    maxCollateral: maxCollateralFromContext,
    selectedErc20Apy,
    selectedSwapToken,
    borrowSwapTokenInput,
    setBorrowSwapTokenInput,
  } = useGetBorrowSectionContext();
  const { address } = useAccount();

  const { isStrategiesSection, strategyAction } = useGetGlobalPropsContext();

  const strategyType = strategyAction;

  const isStableView = !isStrategiesSection;
  const matchingCollateralToken = !isStableView
    ? selectedOpportunity?.collateralToken
    : selectedCollateralToken;

  const { tokenMetadata: principalTokenMetadata } = useGetTokenMetadata(
    selectedOpportunity.principalToken?.address ?? ""
  );

  const { tokenMetadata: collateralTokenMetadata } = useGetTokenMetadata(
    selectedOpportunity.collateralToken?.address ?? ""
  );

  if (
    !isStableView &&
    collateralTokenMetadata &&
    matchingCollateralToken &&
    !("logo" in matchingCollateralToken)
  ) {
    type TokenKey = keyof typeof collateralTokenMetadata;

    const token = matchingCollateralToken as Record<string, any>;

    for (const key of Object.keys(collateralTokenMetadata) as TokenKey[]) {
      if (!(key in token)) {
        token[key] = collateralTokenMetadata[key];
      }
    }
  }

  const { isWhitelistedToken } = useGetGlobalPropsContext();
  const whitelistedToken = isWhitelistedToken(matchingCollateralToken?.address);
  const [staticMaxCollateral, setStaticMaxCollateral] = useState<bigint>();

  const isLenderGroup = selectedOpportunity.isLenderGroup;

  const { data: collateralTokenBalance, isFetched } = useBalance({
    address,
    token: selectedOpportunity.collateralToken?.address,
  });

  const tokenIsWhitelistedAndBalanceIs0 =
    (isStableView
      ? isWhitelistedToken(selectedOpportunity.collateralToken?.address)
      : true) &&
    (!collateralTokenBalance || collateralTokenBalance.value === 0n);
  const [collateralTokenValue, setCollateralTokenValue] =
    useState<TokenInputType>({});

  const collateralWalletBalance = useBalance({
    token: matchingCollateralToken?.address,
    address,
  });

  if (
    !isStableView &&
    matchingCollateralToken &&
    !("balance" in matchingCollateralToken)
  ) {
    const balanceMetadata = {
      balance: Number(
        BigInt(collateralWalletBalance?.data?.value ?? 0n)
      ).toString(),
      balanceBigInt: collateralWalletBalance?.data?.value,
    };
    type TokenKey = keyof typeof balanceMetadata;

    const token = matchingCollateralToken as Record<string, any>;

    for (const key of Object.keys(balanceMetadata) as TokenKey[]) {
      if (!(key in token)) {
        token[key] = balanceMetadata[key];
      }
    }
  }

  const {
    displayedPrincipal: displayedPrincipalFromLCFa,
    isLoading,
    maxCollateral: maxCollateralFromLCFa,
    maxLoanAmount: maxLoanAmountFromLCFa,
    maxLoanAmountNumber: maxLoanAmountNumberFromLCFa,
  } = useGetCommitmentMax({
    collateralTokenDecimals: matchingCollateralToken?.decimals,
    commitment: selectedOpportunity,
    requestedCollateral: collateralTokenValue.valueBI,
    returnCalculatedLoanAmount: true,
  });

  const liquidityPoolsCommitmentMax = useLiquidityPoolsCommitmentMax({
    lenderGroupCommitment: selectedOpportunity,
    collateralAmount: collateralTokenValue.valueBI,
    skip: !isLenderGroup,
    tokenIsWhitelistedAndBalanceIs0,
  });

  const maxCollateral = isLenderGroup
    ? liquidityPoolsCommitmentMax.maxCollateral
    : maxCollateralFromLCFa;

  const maxLoanAmount = isLenderGroup
    ? liquidityPoolsCommitmentMax.maxLoanAmount
    : maxLoanAmountFromLCFa;

  const maxLoanAmountNumber = isLenderGroup
    ? liquidityPoolsCommitmentMax.maxLoanAmountNumber
    : maxLoanAmountNumberFromLCFa;

  const displayedPrincipal = isLenderGroup
    ? liquidityPoolsCommitmentMax.maxLoanAmount
    : displayedPrincipalFromLCFa;

  const defaultAmountCheck = address
    ? tokenIsWhitelistedAndBalanceIs0 &&
      collateralWalletBalance.data !== undefined
    : !isFetched;

  useEffect(() => {
    if (collateralTokenValue.valueBI === undefined) {
      if (defaultAmountCheck) {
        setCollateralTokenValue({
          token: selectedCollateralToken ?? matchingCollateralToken,
          value: 1,
          valueBI: parseUnits(
            "1",
            selectedOpportunity?.collateralToken?.decimals ?? 18
          ),
        });
      }
    }

    if (
      !!(
        collateralWalletBalance.data?.value &&
        collateralWalletBalance.data?.value > 0n
      ) &&
      !staticMaxCollateral &&
      maxCollateral
    ) {
      setStaticMaxCollateral(maxCollateral);
    }

    if (staticMaxCollateral && collateralTokenValue.valueBI === undefined) {
      setCollateralTokenValue({
        token: matchingCollateralToken,
        value: Number(
          formatUnits(
            staticMaxCollateral ?? 0n,
            matchingCollateralToken?.decimals ?? 0
          )
        ),
        valueBI: staticMaxCollateral ?? 0n,
      });
    }
  }, [
    collateralTokenValue,
    defaultAmountCheck,
    selectedCollateralToken,
    matchingCollateralToken,
    selectedOpportunity?.collateralToken?.decimals,
    collateralWalletBalance.data?.value,
    staticMaxCollateral,
    maxCollateral,
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
  const { referralFee, isTradeMode, setStrategyAction } =
    useGetGlobalPropsContext();

  const totalFeePercent =
    protocolFeePercent +
    +(selectedOpportunity?.marketplace?.marketplaceFeePercent ?? 0) +
    (referralFee ?? 0);

  const totalFees = (maxLoanAmountNumber * totalFeePercent) / 10000;
  const loanMinusFees =
    (maxLoanAmountNumber * (10000 - totalFeePercent)) / 10000;

  const payPerLoan = useMemo(
    () =>
      numberWithCommasAndDecimals(
        (((+(selectedOpportunity?.minAPY ?? 0) / 10000) * maxLoanAmountNumber) /
          365) *
          (convertSecondsToDays(
            Number(selectedOpportunity?.maxDuration ?? 0)
          ) ?? 0),
        2
      ),
    [selectedOpportunity, maxLoanAmountNumber]
  );

  const { chainName } = useChainData();

  const lenderGroupTransactions = useBorrowFromPool({
    skip: !isLenderGroup,
    commitmentPoolAddress: selectedOpportunity?.lenderAddress ?? "0x",
    principalAmount: maxLoanAmount.toString(),
    collateralAmount: (collateralTokenValue.valueBI ?? 0).toString(),
    collateralTokenAddress: collateralTokenValue.token?.address ?? "0x",
    loanDuration: selectedOpportunity?.maxDuration?.toString(),
    marketId: selectedOpportunity?.marketplaceId,
    onSuccess: (receipt: any) => {
      // match the structure of a succesful loan from a LCFa so it works with the confirmation screen
      const loanParams = {
        args: [
          {},
          {
            principalAmount: maxLoanAmount,
            collateralAmount: collateralTokenValue.valueBI,
          },
        ],
      };

      setCurrentStep(BorrowSectionSteps.SUCCESS);
      setSuccessLoanHash(receipt);
      setSuccessfulLoanParams(loanParams);
    },
  });

  const isCollateralMoreThanBalance =
    (collateralWalletBalance?.data?.value ?? 0n) <
    (collateralTokenValue.valueBI ?? 0n);

  const isCollateralMoreThanMax =
    liquidityPoolsCommitmentMax.maxAvailableCollateralInPool <
    (collateralTokenValue.valueBI ?? 0n);

  const actionVerb =
    strategyAction === STRATEGY_ACTION_ENUM.SHORT
      ? "Short"
      : strategyAction === STRATEGY_ACTION_ENUM.LONG
      ? "Borrow"
      : "Borrow";

  // if STRATEGY_ACTION_ENUM is LONG or SHORT
  // create and import hook to call borrowswap contract and call getExactInput
  // hook returns both generateSwapPath and quoteExactInput

  const finalStrategyToken =
    strategyAction === STRATEGY_ACTION_ENUM.SHORT
      ? matchingCollateralToken
      : selectedSwapToken;

  const { borrowSwapPaths, borrowQuoteExactInput } = useGetBorrowSwapData({
    principalTokenAddress: selectedOpportunity?.principalToken?.address,
    principalAmount: maxLoanAmount?.toString(),
    finalTokenAddress: finalStrategyToken?.address,
  });

  useEffect(() => {
    setBorrowSwapTokenInput?.({
      token: finalStrategyToken,
      value: Number(
        formatUnits(
          borrowQuoteExactInput ?? 0n,
          finalStrategyToken?.decimals ?? 18
        )
      ),
      valueBI: borrowQuoteExactInput,
    });
  }, [
    borrowQuoteExactInput,
    collateralTokenValue.token?.address,
    finalStrategyToken,
    matchingCollateralToken?.decimals,
    setBorrowSwapTokenInput,
  ]);

  const isLoadingBorrowSwap = !borrowSwapPaths || !borrowQuoteExactInput;

  return (
    <div className="opportunity-details">
      {isTradeMode ? (
        <StrategiesSelect
          renderFlag
          showStrategy={false}
          value={strategyAction ?? ""}
          onValueChange={setStrategyAction}
        />
      ) : (
        <div className="back-pill-row">
          <BackButton
            onClick={() => {
              if (
                isStrategiesSection &&
                strategyAction === STRATEGY_ACTION_ENUM.LONG
              ) {
                // go to SWAP TOKENS route
                setCurrentStep(BorrowSectionSteps.SELECT_SWAP_TOKEN);
              } else {
                // fallback: go back to SELECT_OPPORTUNITY
                setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
              }
            }}
          />
          {!isStableView && strategyAction === STRATEGY_ACTION_ENUM.FARM && (
            <span
              style={{
                fontSize: "11px",
                padding: "2px 5px !important",
              }}
            >
              <DataPill
                label={`${selectedErc20Apy}% APY`}
                logo={
                  "https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"
                }
                linkOut={`https://app.uniswap.org/explore/tokens/${normalizeChainName(
                  chainName
                )?.replace(
                  /-one/g,
                  ""
                )}/${selectedOpportunity?.principalToken?.address.toLocaleLowerCase()}`}
              />
            </span>
          )}
        </div>
      )}
      <TokenInput
        tokenValue={collateralTokenValue}
        label={
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            Deposit
            <Tooltip
              description={`Deposit ${
                matchingCollateralToken?.symbol
              } to ${actionVerb} ${
                selectedOpportunity?.principalToken?.symbol
              } for ${convertSecondsToDays(
                Number(selectedOpportunity?.maxDuration)
              )} days${isStableView ? "—extend anytime via rollover" : ""}.`}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="tooltip-svg"
                  style={{ position: "relative", top: "1px" }}
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 16v-4" strokeWidth="2" />
                  <circle cx="12" cy="8" r="1" />
                </svg>
              }
            />
          </div>
        }
        maxAmount={staticMaxCollateral}
        imageUrl={matchingCollateralToken?.logo || ""}
        sublabelUpper={`Max: ${numberWithCommasAndDecimals(
          formatUnits(
            staticMaxCollateral ?? 0n,
            matchingCollateralToken?.decimals ?? 0
          )
        )} ${matchingCollateralToken?.symbol}`}
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
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {actionVerb}{" "}
            <Tooltip
              description={`${actionVerb} ${
                selectedOpportunity?.principalToken?.symbol
              } for ${convertSecondsToDays(
                Number(selectedOpportunity?.maxDuration)
              )} days${isStableView ? "—extend anytime via rollover" : ""}.`}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="tooltip-svg"
                  style={{ position: "relative", top: "1px" }}
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 16v-4" strokeWidth="2" />
                  <circle cx="12" cy="8" r="1" />
                </svg>
              }
            />
          </div>
        }
        imageUrl={principalTokenMetadata?.logo || ""}
        sublabelUpper={
          <span>
            Duration:{" "}
            {convertSecondsToDays(Number(selectedOpportunity?.maxDuration))}{" "}
            days
            {(isStableView || strategyAction === STRATEGY_ACTION_ENUM.LONG) && (
              <>
                {" • Rollover: "}
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
              </>
            )}
          </span>
        }
        readonly
      />

      {isStrategiesSection && strategyAction === STRATEGY_ACTION_ENUM.LONG && (
        <div>
          <img src={separatorWithCaret} className="separator" />
          <TokenInput
            tokenValue={(borrowSwapTokenInput as TokenInputType) ?? 0}
            label={
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                {"Long "}
                <Tooltip
                  description={`Long & receive ${
                    selectedSwapToken?.symbol
                  } for ${convertSecondsToDays(
                    Number(selectedOpportunity?.maxDuration)
                  )} days${
                    isStableView ? "—extend anytime via rollover" : ""
                  }.`}
                  icon={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="tooltip-svg"
                      style={{ position: "relative", top: "1px" }}
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 16v-4" strokeWidth="2" />
                      <circle cx="12" cy="8" r="1" />
                    </svg>
                  }
                />
              </div>
            }
            imageUrl={selectedSwapToken?.logo || ""}
            readonly
          />
        </div>
      )}

      <div className="section-title fee-details">
        Interest: {payPerLoan} {selectedOpportunity.principalToken?.symbol} •
        Fees: {numberWithCommasAndDecimals(totalFees)}{" "}
        {selectedOpportunity.principalToken?.symbol}
      </div>

      {!isStableView && (
        <div className="section-title fee-details" style={{ color: "#3D8974" }}>
          {strategyAction === STRATEGY_ACTION_ENUM.FARM ? (
            <>
              Est. earned on uni: +{" "}
              {numberWithCommasAndDecimals(
                loanMinusFees *
                  (parseFloat(selectedErc20Apy) / 100) *
                  convertSecondsToDays(
                    Number(selectedOpportunity?.maxDuration) / 365
                  )
              )}{" "}
              {selectedOpportunity.principalToken?.symbol}
            </>
          ) : strategyAction === STRATEGY_ACTION_ENUM.SHORT ? (
            <>
              Also receive: {borrowSwapTokenInput?.value?.toFixed(2)}{" "}
              {selectedOpportunity.collateralToken?.symbol}
            </>
          ) : null}
        </div>
      )}

      {isNewBorrower ? (
        <Button
          label="Accept terms"
          onClick={() => setCurrentStep(BorrowSectionSteps.ACCEPT_TERMS)}
          isFullWidth
          useTransactionButtonContext
        />
      ) : isStrategiesSection &&
        (strategyAction === STRATEGY_ACTION_ENUM.LONG ||
          strategyAction === STRATEGY_ACTION_ENUM.SHORT) ? (
        isLoadingBorrowSwap ? (
          <Loader isSkeleton height={40} />
        ) : (
          <BorrowSwapButton
            collateralToken={collateralTokenValue}
            commitment={selectedOpportunity}
            principalToken={maxLoanAmount}
            principalTokenAddress={selectedOpportunity?.principalToken?.address.toLocaleLowerCase()}
            borrowSwapPaths={borrowSwapPaths}
            borrowQuoteExactInput={borrowQuoteExactInput}
          />
        )
      ) : isLenderGroup ? (
        <TransactionButton
          transactions={lenderGroupTransactions}
          isButtonDisabled={
            !address || isCollateralMoreThanBalance || isCollateralMoreThanMax
          }
          buttonDisabledMessage={
            address
              ? isCollateralMoreThanMax
                ? "Insufficient liquidity"
                : "Insufficient collateral"
              : ""
          }
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
