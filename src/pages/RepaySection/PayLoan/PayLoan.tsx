import { useState } from "react";
import { formatUnits } from "viem";

import BackButton from "../../../components/BackButton";
import DataField from "../../../components/DataField";
import LoanLink from "../../../components/LoanLink";
import TokenInput from "../../../components/TokenInput";
import { TokenInputType } from "../../../components/TokenInput/TokenInput";
import TokenLogo from "../../../components/TokenLogo";
import TransactionButton from "../../../components/TransactionButton";
import { SUPPORTED_TOKEN_LOGOS } from "../../../constants/tokens";
import { formatTimestampToShortDate } from "../../../helpers/dateUtils";
import { numberWithCommasAndDecimals } from "../../../helpers/numberUtils";
import { usePayLoan } from "../../../hooks/usePayLoan";
import {
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "../RepaySectionContext";
import "./payLoan.scss";

const PayLoan: React.FC = () => {
  const {
    setCurrentStep,
    loan,
    collateralImageURL,
    setPaidTokenInput,
    setSuccesfulTxHash,
  } = useGetRepaySectionContext();

  const [tokenValue, setTokenValue] = useState<TokenInputType>({
    token: loan.lendingToken,
    value: 0,
    valueBI: BigInt(0),
  });

  const { transactions, formattedWalletBalance, totalOwedNum } = usePayLoan(
    loan,
    tokenValue.value,
    setSuccesfulTxHash
  );

  const principalTokenLogo = SUPPORTED_TOKEN_LOGOS[loan.lendingToken.symbol];

  const collateral = loan.collateral[0];

  const onTokenInputChange = (value: TokenInputType) => {
    setTokenValue(value);
    setPaidTokenInput(value);
  };

  return (
    <div className="pay-loan">
      <BackButton onClick={() => setCurrentStep(RepaySectionSteps.LOANS)} />
      <h2>Repay cash advance</h2>
      <LoanLink loan={loan} />
      <TokenInput
        imageUrl={principalTokenLogo}
        label={
          <div className="pay-loan-token-input">
            Amount
            <div className="wallet-amount">
              My wallet: {formattedWalletBalance} {loan.lendingToken.symbol}{" "}
            </div>
          </div>
        }
        maxAmount={Number(totalOwedNum)}
        tokenValue={tokenValue}
        onChange={onTokenInputChange}
        limitToMax
      />
      <DataField>
        <div className="loan-information">
          <div className="loan-information-row">
            <div>Due Date</div>
            <div>{formatTimestampToShortDate(loan.nextDueDate)}</div>
          </div>
          <div className="loan-information-row">
            <div>Collateral Amount </div>
            <div className="token-data">
              {numberWithCommasAndDecimals(
                formatUnits(
                  BigInt(collateral.amount),
                  collateral.token.decimals
                )
              )}{" "}
              {collateral.token.symbol}
              <TokenLogo logoUrl={collateralImageURL} />
            </div>
          </div>
          <div className="loan-information-row">
            <div>Total owed</div>
            <div className="token-data">
              {numberWithCommasAndDecimals(totalOwedNum)}{" "}
              {loan.lendingToken.symbol}
              <TokenLogo logoUrl={principalTokenLogo} />
            </div>
          </div>
        </div>
      </DataField>
      <TransactionButton
        transactions={transactions}
        onSuccess={() => setCurrentStep(RepaySectionSteps.CONFIRMATION)}
      />
    </div>
  );
};

export default PayLoan;