import cx from "classnames";
import dayjs from "dayjs";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

import BackButton from "../../components/BackButton";
import DataField from "../../components/DataField";
import Dropdown from "../../components/Dropdown";
import Loader from "../../components/Loader";
import LoanLink from "../../components/LoanLink";
import { useGetRolloverableCommitments } from "../../hooks/queries/useGetRolloverableCommitments";
import { useGetUserTokenContext } from "../../contexts/UserTokensContext";
import { useChainTerms } from "../../hooks/useChainTerms";
import { useGetMaxPrincipalPerCollateralFromLCFAlpha } from "../../hooks/useGetMaxPrincipalPerCollateralFromLCFAlpha";
import {
  ContractType,
  SupportedContractsEnum,
  useReadContract,
} from "../../hooks/useReadContract";
import {
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "../RepaySection/RepaySectionContext";
import "./rolloverLoan.scss";

import TokenInput, {
  TokenInputType,
} from "../../components/TokenInput/TokenInput";
import TokenLogo from "../../components/TokenLogo";
import TransactionButton from "../../components/TransactionButton";
import { SUPPORTED_TOKEN_LOGOS } from "../../constants/tokens";
import { abs, bigIntMax, bigIntMin } from "../../helpers/bigIntMath";
import {
  convertSecondsToDays,
  formatTimestampToShortDate,
} from "../../helpers/dateUtils";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import useDebounce from "../../hooks/useDebounce";
import { useCommitmentMax } from "../../hooks/useGetCommitmentMax";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";
import useRolloverLoan from "../../hooks/useRolloverLoan";

type RolloverData = {
  dueDate: string;
  loanAmount: ReactNode;
  apr: string;
  collateral?: ReactNode;
  payNow?: ReactNode;
};

type RolloverDataRowProps = {
  label: string;
  prevValue?: ReactNode;
  newValue: ReactNode;
  classNames?: string;
  collateralBalance?: string;
  tokenSymbol?: string;
};

const RolloverDataRow: React.FC<RolloverDataRowProps> = ({
  label,
  newValue,
  prevValue,
  classNames,
}) => {
  return (
    <div className={cx("rollover-data-row", classNames)}>
      <span>{label}</span>
      <div className="value-container">
        {prevValue && (
          <>
            <span>{prevValue}</span> →
          </>
        )}
        <span className="next-value">{newValue}</span>
      </div>
    </div>
  );
};

const CollateralDataRow: React.FC<RolloverDataRowProps> = ({
  label,
  newValue,
  prevValue,
  classNames,
  collateralBalance,
  tokenSymbol,
}) => {
  return (
    <div className={cx("collateral-data-row", classNames)}>
      <span className="collateral-value-container">
        <span>{label}</span>
        <span className="prev-value">
          <span>{prevValue}</span> →
        </span>
        <span className="collateral-input">{newValue}</span>
        <span className="collateral-balance">
          Max collateral: {collateralBalance} {tokenSymbol}
        </span>
      </span>
    </div>
  );
};

const RolloverLoan: React.FC = () => {
  const {
    setCurrentStep,
    loan,
    collateralImageURL,
    setSuccessfulRolloverParams,
  } = useGetRepaySectionContext();

  const collateralTokenAddress = loan.collateral[0].collateralAddress;

  const loanCollateral = loan.collateral[0];

  const principalTokenIcon = SUPPORTED_TOKEN_LOGOS[loan.lendingToken.symbol];

  const chainTerms = useChainTerms();

  const { filteredCommitments, isLoading: rolloverableCommitmentsLoading } =
    useGetRolloverableCommitments(
      collateralTokenAddress,
      loan.lendingToken.address
    );

  const marketIds = Object.keys(filteredCommitments);

  const dropdownOptions = useMemo(
    () =>
      (chainTerms?.dropdownOptions ?? []).filter((option) => {
        return marketIds.includes(option.value);
      }),
    [chainTerms?.dropdownOptions, marketIds]
  );

  const [duration, setDuration] = useState(dropdownOptions[0]);

  useEffect(() => {
    !duration && setDuration(dropdownOptions[0]);
  }, [dropdownOptions, duration]);

  const commitment = filteredCommitments[duration?.value];

  const commitmentCollateral = commitment?.collateralToken;

  const chainId = useChainId();

  const { protocolFeePercent } = useGetProtocolFee();
  const { referralFee } = useGetUserTokenContext();

  const { address: userAddress } = useAccount();

  const { isCommitmentFromLCFAlpha, maxPrincipalPerCollateral } =
    useGetMaxPrincipalPerCollateralFromLCFAlpha(commitment);

  const isSameLender =
    commitment?.lenderAddress?.toLowerCase() ===
    loan?.lenderAddress?.toLowerCase();

  const collateralBalance = useReadContract(
    commitmentCollateral?.address as Address,
    "balanceOf",
    [userAddress],
    false,
    ContractType.ERC20
  );
  const requestedCollateral = BigInt(loanCollateral?.amount) ?? 0;

  const requestedCollateralPlusWalletCollateral =
    requestedCollateral + BigInt(collateralBalance.data ?? 0);

  const { data: totalOwedData }: any = useReadContract(
    SupportedContractsEnum.TellerV2,
    `calculateAmountOwed`,
    [loan.bidId, loan.nextDueDate],
    !loan.nextDueDate
  );

  const totalOwedBI = !!totalOwedData
    ? BigInt(totalOwedData.interest) + BigInt(totalOwedData.principal)
    : BigInt(0);

  let maxLoanAmountFromLender;
  let defaultLoanAmountLender;

  if (isSameLender) {
    maxLoanAmountFromLender = bigIntMin(
      BigInt(totalOwedBI) + BigInt(commitment?.committedAmount),
      BigInt(commitment?.maxPrincipal ?? 0) -
        BigInt(commitment?.acceptedPrincipal ?? 0)
    );

    defaultLoanAmountLender = bigIntMin(totalOwedBI, maxLoanAmountFromLender);
  } else {
    maxLoanAmountFromLender = defaultLoanAmountLender = totalOwedBI;
  }

  const lenderCommitmentForwarder = isCommitmentFromLCFAlpha
    ? SupportedContractsEnum.LenderCommitmentForwarderAlpha
    : SupportedContractsEnum.LenderCommitmentForwarderStaging;

  const requiredCollateralArgs = useCallback(
    (loanAmount?: bigint) => [
      loanAmount,
      maxPrincipalPerCollateral,
      1,
      ...(isCommitmentFromLCFAlpha
        ? ""
        : [
            commitment?.collateralToken?.address,
            commitment?.principalTokenAddress,
          ]),
    ],
    [
      commitment?.collateralToken?.address,
      commitment?.principalTokenAddress,
      isCommitmentFromLCFAlpha,
      maxPrincipalPerCollateral,
    ]
  );

  const {
    data: requiredCollateralDefaultLoan,
    isLoading: requiredCollateralLoading,
  } = useReadContract<bigint>(
    lenderCommitmentForwarder,
    "getRequiredCollateral",
    requiredCollateralArgs(defaultLoanAmountLender),
    !isSameLender
  );

  const {
    data: maxLenderCollateralSuported,
    isLoading: maxLenderCollateralSuportedLoading,
  } = useReadContract<bigint>(
    lenderCommitmentForwarder,
    "getRequiredCollateral",
    requiredCollateralArgs(maxLoanAmountFromLender),
    !isSameLender
  );

  const {
    maxCollateral: maxCollateralWithWalletBalance,
    isLoading: maxCollateralWithWalletBalanceLoading,
  } = useCommitmentMax({
    commitment,
    requestedCollateral:
      isSameLender &&
      maxLenderCollateralSuported &&
      maxLenderCollateralSuported <
        BigInt(requestedCollateralPlusWalletCollateral)
        ? maxLenderCollateralSuported
        : requestedCollateralPlusWalletCollateral,
    isRollover: true,
    collateralTokenDecimals: loanCollateral?.token.decimals ?? 0,
    loanAmount: isSameLender ? totalOwedBI : BigInt(0),
  });

  const defaultCollateralValueAmount = bigIntMin(
    BigInt(loanCollateral?.amount),
    maxCollateralWithWalletBalance
  );

  const defaultCollateralValue = useMemo(
    () => ({
      token: {
        address: loanCollateral?.collateralAddress,
        decimals: loanCollateral?.token.decimals,
        symbol: loanCollateral?.token.symbol,
      },
      valueBI: defaultCollateralValueAmount,
      value: Number(
        formatUnits(
          defaultCollateralValueAmount,
          loanCollateral?.token.decimals
        )
      ),
    }),
    [
      defaultCollateralValueAmount,
      loanCollateral?.collateralAddress,
      loanCollateral?.token.decimals,
      loanCollateral?.token.symbol,
    ]
  );

  const [collateralValue, setCollateralValue] = useState<TokenInputType>(
    defaultCollateralValue
  );

  useEffect(() => {
    if (
      (isSameLender && !requiredCollateralDefaultLoan) ||
      !maxCollateralWithWalletBalance ||
      collateralValue.valueBI
    ) {
      return;
    }

    if (
      (isSameLender &&
        (requiredCollateralDefaultLoan ?? 0) > BigInt(0) &&
        collateralValue.valueBI === BigInt(0)) ||
      (maxCollateralWithWalletBalance > BigInt(0) &&
        collateralValue.valueBI === BigInt(0))
    ) {
      setCollateralValue(defaultCollateralValue);
    }
  }, [
    requiredCollateralDefaultLoan,
    maxCollateralWithWalletBalance,
    collateralValue,
    defaultCollateralValue,
    isSameLender,
    duration,
    collateralValue.valueBI,
  ]);

  const collateralAmountDebounced = useDebounce(collateralValue, 250);

  const loanAPR = +loan.apr / 100; // BigNumber.from( loan.apr ).div(10000)

  const currentLoanAmount = numberWithCommasAndDecimals(
    formatUnits(totalOwedBI, loan.lendingToken.decimals)
  );

  const {
    maxLoanAmount,
    maxCollateral,
    isLoading: maxCollateralLoading,
  } = useCommitmentMax({
    commitment,
    requestedCollateral: collateralAmountDebounced.valueBI,
    isRollover: true,
    collateralTokenDecimals: loanCollateral?.token.decimals ?? 0,
    returnCalculatedLoanAmount: true,
  });

  const currentValues: RolloverData = useMemo(
    () => ({
      apr: `${loanAPR.toString()}%`,
      dueDate: formatTimestampToShortDate(loan.nextDueDate),
      loanAmount: currentLoanAmount,
      collateral: numberWithCommasAndDecimals(
        formatUnits(
          BigInt(loanCollateral?.amount || 0),
          loanCollateral?.token.decimals
        ),
        undefined,
        false
      ),
    }),
    [
      currentLoanAmount,
      loan.nextDueDate,
      loanAPR,
      loanCollateral?.amount,
      loanCollateral?.token.decimals,
    ]
  );

  const nextDueDate = useMemo(() => {
    const now = new Date().getTime();
    const days = convertSecondsToDays(Number(commitment?.maxDuration));
    return dayjs(now).add(days, "days").format("MM/DD/YYYY");
  }, [commitment?.maxDuration]);

  const formattedMaxCollateral = formatUnits(
    maxCollateralWithWalletBalance,
    loanCollateral?.token.decimals
  );

  const nextValues: RolloverData = useMemo(
    () => ({
      apr: `${+(commitment?.minAPY ?? 0) / 100}%`,
      dueDate: nextDueDate,
      loanAmount: (
        <>
          {numberWithCommasAndDecimals(
            formatUnits(BigInt(maxLoanAmount), loan.lendingToken.decimals)
          )}
          <TokenLogo logoUrl={principalTokenIcon} />
        </>
      ),
      collateral: (
        <TokenInput
          onChange={(token) => setCollateralValue(token)}
          imageUrl={collateralImageURL}
          tokenValue={collateralValue}
          min
          minAmount={defaultCollateralValue.valueBI}
          key={commitment?.id}
          maxAmount={Number(formattedMaxCollateral)}
        />
      ),
    }),
    [
      collateralImageURL,
      collateralValue,
      commitment?.id,
      commitment?.minAPY,
      defaultCollateralValue.valueBI,
      formattedMaxCollateral,
      loan.lendingToken.decimals,
      maxLoanAmount,
      nextDueDate,
      principalTokenIcon,
    ]
  );

  const isInputMoreThanMaxCollateral =
    BigInt(collateralAmountDebounced.valueBI ?? 0) >
    BigInt(maxCollateralWithWalletBalance);

  const { transactions, rolloverLoanEstimation, borrowerAmount } =
    useRolloverLoan(
      loan,
      commitment,
      maxCollateral,
      isInputMoreThanMaxCollateral,
      maxLoanAmount
    );

  const marketplaceFee = +(commitment?.marketplace?.marketplaceFeePercent ?? 0);
  const totalFeePercent =
    10000 - ((protocolFeePercent ?? 0) + marketplaceFee + (referralFee ?? 0));

  const amountToPay =
    (maxLoanAmount * BigInt(totalFeePercent)) / BigInt(10000) -
    BigInt(totalOwedBI);

  const displayedAmountToPay =
    amountToPay < 0n
      ? bigIntMax(abs(amountToPay), borrowerAmount)
      : amountToPay;

  const isLoading =
    defaultCollateralValue.valueBI === 0n ||
    requiredCollateralLoading ||
    maxCollateralLoading ||
    maxLenderCollateralSuportedLoading ||
    maxCollateralWithWalletBalanceLoading;

  return (
    <div className="rollover-loan">
      <div className="header-info">
        <BackButton onClick={() => setCurrentStep(RepaySectionSteps.LOANS)} />
        <LoanLink loan={loan} />
      </div>
      <h2>Extend cash advance</h2>
      {rolloverableCommitmentsLoading || !commitment ? (
        <Loader height={55} isSkeleton />
      ) : (
        <Dropdown
          options={dropdownOptions}
          selectedOption={duration}
          onChange={setDuration}
          label="Duration"
          readonly={dropdownOptions.length === 1}
        />
      )}
      <DataField>
        {isLoading ? (
          <Loader isSkeleton height={216} />
        ) : (
          <>
            <RolloverDataRow
              label="Next due"
              prevValue={currentValues.dueDate}
              newValue={nextValues.dueDate}
            />
            <RolloverDataRow
              label="Loan"
              prevValue={currentValues.loanAmount}
              newValue={nextValues.loanAmount}
            />
            <RolloverDataRow
              label="APR"
              prevValue={currentValues.apr}
              newValue={nextValues.apr}
            />
            <CollateralDataRow
              label="Collateral"
              prevValue={currentValues.collateral}
              newValue={nextValues.collateral}
              classNames="collateral-row"
              collateralBalance={numberWithCommasAndDecimals(
                formattedMaxCollateral
              )}
              tokenSymbol={loanCollateral?.token.symbol}
            />
            {!(amountToPay === 0n) && (
              <RolloverDataRow
                label={amountToPay < 0n ? "Pay now" : "Receive"}
                newValue={
                  <div className="next-value">
                    {numberWithCommasAndDecimals(
                      formatUnits(
                        abs(displayedAmountToPay),
                        commitment?.principalToken?.decimals ?? 0
                      ),
                      3
                    )}
                    <TokenLogo logoUrl={principalTokenIcon} />
                  </div>
                }
              />
            )}
          </>
        )}
      </DataField>
      <TransactionButton transactions={transactions} />
    </div>
  );
};

export default RolloverLoan;
