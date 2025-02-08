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
import { useGetTokenMetadata } from "../../../hooks/useGetTokenMetadata";

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

  const onSuccessfulTx = (txHash: string) => {
    setSuccesfulTxHash(txHash);
    setCurrentStep(RepaySectionSteps.CONFIRMATION);
  };

  const {
    transactions,
    formattedWalletBalance,
    currentAmountDueBI,
    currentAmountDueNum,
  } = usePayLoan(loan, tokenValue.valueBI ?? BigInt(0), onSuccessfulTx);

  const { tokenMetadata: principalTokenMetadata } = useGetTokenMetadata(
    loan.lendingToken.address
  );

  const principalTokenLogo = principalTokenMetadata?.logo;

  const collateral = loan.collateral[0];

  const onTokenInputChange = (value: TokenInputType) => {
    setTokenValue(value);
    setPaidTokenInput(value);
  };

  return (
    <div className="pay-loan">
      <div className="header-info">
        <BackButton onClick={() => setCurrentStep(RepaySectionSteps.LOANS)} />
        <LoanLink loan={loan} />
      </div>
      <h2>Repay cash advance</h2>
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
        maxAmount={currentAmountDueBI}
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
              {numberWithCommasAndDecimals(currentAmountDueNum)}{" "}
              {loan.lendingToken.symbol}
              <TokenLogo logoUrl={principalTokenLogo} />
            </div>
          </div>
        </div>
      </DataField>
      <TransactionButton transactions={transactions} />
    </div>
  );
};

export default PayLoan;
