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

import { useAccount, useBalance, useChainId } from "wagmi";
import Button from "../../../components/Button";
import TransactionButton from "../../../components/TransactionButton";
import { useIsNewBorrower } from "../../../hooks/queries/useIsNewBorrower";
import { useBorrowFromPool } from "../../../hooks/useBorrowFromPool";
import { useGetProtocolFee } from "../../../hooks/useGetProtocolFee";
import { useLiquidityPoolsCommitmentMax } from "../../../hooks/useLiquidityPoolsCommitmentMax";
import { AcceptCommitmentButton } from "./AcceptCommitmentButton";
import { BorrowSwapButton } from "./BorrowSwapButton";

import Loader from "../../../components/Loader/Loader";
import { useGetBorrowSwapData } from "../../../hooks/useGetBorrowSwapData";
import { StrategiesSelect } from "../CollateralTokenList/CollateralTokenList";
import { useGetTokenPriceFromDerivedETH } from "../../../hooks/useGetTokenPriceFromDerivedETH";
import { useGetAPRForLiquidityPools } from "../../../hooks/useGetAPRForLiquidityPools";

const OpportunityDetails = () => {
  const {
    setCurrentStep,
    selectedOpportunity,
    selectedCollateralToken,
    setSuccessLoanHash,
    setSuccessfulLoanParams,
    selectedErc20Apy,
    selectedSwapToken,
    borrowSwapTokenInput,
    setBorrowSwapTokenInput,
  } = useGetBorrowSectionContext();
  const { address, connector } = useAccount();
  const chainId = useChainId();

  const { isStrategiesSection, strategyAction } = useGetGlobalPropsContext();

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

  const isLiquidityPool = selectedOpportunity.isLenderGroup;
  console.log("isLiquidityPool", isLiquidityPool);
  console.log("maxLoanAmountNumber", maxLoanAmountNumber);
  console.log(
    "selectedOpportunity.lenderAddres",
    selectedOpportunity.lenderAddress
  );
  const { data: liquidityPoolApr, isLoading: aprLoading = false } =
    useGetAPRForLiquidityPools(
      selectedOpportunity.lenderAddress ?? "0x",
      maxLoanAmountNumber.toString(),
      !isLiquidityPool
    );
  console.log("liquidityPoolApr", liquidityPoolApr);
  const apr = isLiquidityPool ? liquidityPoolApr : selectedOpportunity.minAPY;
  console.log("apr", apr);
  const interest =
    (Number(apr) / 100) *
    (Number(selectedOpportunity.maxDuration) / 86400 / 365);
  console.log("interest", interest);

  const payPerLoan = useMemo(
    () => numberWithCommasAndDecimals(interest, 2),
    [interest]
  );

  const { chainName } = useChainData();

  const { getTokenPrice } = useGetTokenPriceFromDerivedETH();

  const lenderGroupTransactions = useBorrowFromPool({
    skip: !isLenderGroup,
    commitmentPoolAddress: selectedOpportunity?.lenderAddress ?? "0x",
    principalAmount: maxLoanAmount.toString(),
    collateralAmount: (collateralTokenValue.valueBI ?? 0).toString(),
    collateralTokenAddress: collateralTokenValue.token?.address ?? "0x",
    loanDuration: selectedOpportunity?.maxDuration?.toString(),
    marketId: selectedOpportunity?.marketplaceId,
    onSuccess: (receipt: string) => {
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

      const logBorrowEvent = async () => {
        if (
          !receipt ||
          !collateralTokenValue.token?.address ||
          !collateralTokenValue.value
        )
          return;

        const price = await getTokenPrice(
          collateralTokenValue.token.address,
          collateralTokenValue.value
        );

        if (price) {
          if (window.__adrsbl?.run) {
            const adrsblProperties = [
              { name: "amount", value: collateralTokenValue.value.toString() },
              {
                name: "amount_usd",
                value: price.toString(),
              },
              {
                name: "transaction_id",
                value: receipt,
              },
            ];

            window.__adrsbl.run("user_supply_to_pool", true, adrsblProperties);
          }
        }
      };

      logBorrowEvent().catch(console.error);

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

  const [rewardTokenInput, setRewardTokenInput] = useState<TokenInputType>({
    value: 0,
    valueBI: 0n,
  });

  useEffect(() => {
    const run = async () => {
      const rewardToken =
        selectedCollateralToken?.rewardData?.reward_token_data;
      const rewardPercent = selectedCollateralToken?.rewardPercent;
      const duration = Number(selectedOpportunity?.maxDuration);
      const maxLoanAmount = maxLoanAmountNumber;

      if (!rewardToken || !rewardPercent || !duration || !maxLoanAmount) return;

      const rewardTokenPriceUsd = await getTokenPrice(rewardToken.address, 1);
      if (!rewardTokenPriceUsd || rewardTokenPriceUsd <= 0) return;

      const durationFraction = duration / (365 * 24 * 60 * 60); // Convert seconds to years
      const rewardUsdValue =
        maxLoanAmount * (rewardPercent / 100) * durationFraction;
      const rewardTokenValue = rewardUsdValue / rewardTokenPriceUsd;

      setRewardTokenInput({
        token: rewardToken,
        value: Number(rewardTokenValue.toFixed(rewardToken.decimals ?? 18)),
        valueBI: parseUnits(
          rewardTokenValue.toFixed(rewardToken.decimals ?? 18),
          rewardToken.decimals ?? 18
        ),
      });
    };

    run().catch(console.error);
  }, [
    selectedCollateralToken?.rewardData,
    selectedCollateralToken?.rewardPercent,
    selectedOpportunity?.maxDuration,
    maxLoanAmountNumber,
    getTokenPrice,
  ]);

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
            Rollover every{" "}
            {convertSecondsToDays(Number(selectedOpportunity?.maxDuration))}{" "}
            days
          </span>
        }
        readonly
      />
      {selectedCollateralToken?.rewardData?.pool?.toLowerCase() ===
        selectedOpportunity?.lenderAddress?.toLowerCase() && (
        <div style={{ marginTop: "1rem" }}>
          <TokenInput
            tokenValue={rewardTokenInput}
            label={
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                Rewards
                <Tooltip
                  description={`Borrow and earn ${selectedCollateralToken?.rewardData?.reward_token_data?.symbol} rewards instantly.`}
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
            imageUrl={
              selectedCollateralToken?.rewardData?.reward_token_data?.logo
            }
            readonly
            sublabelUpper={`+${selectedCollateralToken?.rewardPercent}% APR Reward ✨`}
          />
        </div>
      )}

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
