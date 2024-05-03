import React, { createContext, useContext, useState } from "react";
import { useConfig } from "wagmi";
import { Loan } from "../../hooks/queries/useGetActiveLoansForUser";
import { TokenInputType } from "../../components/TokenInput/TokenInput";
import { CommitmentType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";

export enum RepaySectionSteps {
  LOANS,
  REPAY_LOAN,
  ROLLOVER_LOAN,
  CONFIRMATION,
  ROLLOVER_CONFIRMATION,
  ADD_ROLLOVER_TO_CALENDAR,
}

interface RepaySectionContextType {
  paidAmount: string;
  currentStep: RepaySectionSteps;
  setCurrentStep: (step: RepaySectionSteps) => void;
  loan: Loan;
  setLoan: (loan: Loan) => void;
  collateralImageURL: string;
  setCollateralImageURL: (url: string) => void;
  paidTokenInput?: TokenInputType;
  setPaidTokenInput: (tokenInput: TokenInputType) => void;
  successRolloverLoanHash: string;
  setSuccessRolloverLoanHash: (txHash: string) => void;
  rolloverCommitment: CommitmentType;
  setRolloverCommitment: (commitment: CommitmentType) => void;
  bidId: string;
  setBidId: (bidId: string) => void;
  successfulLoanParams: any;
  setSuccessfulRolloverParams: (params: any) => void;
  succesfulTxHash?: string;
  setSuccesfulTxHash: (txHash: string) => void;
}

const RepaySectionContext = createContext<RepaySectionContextType>(
  {} as RepaySectionContextType
);

interface RepaySectionContextProps {
  children: React.ReactNode;
}

export const RepaySectionContextProvider: React.FC<
  RepaySectionContextProps
> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<RepaySectionSteps>(
    RepaySectionSteps.LOANS
  );
  const [selectedLoan, setSelectedLoan] = useState<Loan>({} as Loan);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [collateralImageURL, setCollateralImageURL] = useState<string>("");
  const [paidTokenInput, setPaidTokenInput] = useState<TokenInputType>();
  const [successRolloverLoanHash, setSuccessRolloverLoanHash] =
    useState<string>("");
  const [rolloverCommitment, setRolloverCommitment] =
    useState<CommitmentType>();
  const [succesfulTxHash, setSuccesfulTxHash] = useState<string>("");
  const [bidId, setBidId] = useState<string>("");
  const [successfulLoanParams, setSuccessfulRolloverParams] = useState<{
    args: any[];
  }>();

  return (
    <RepaySectionContext.Provider
      value={{
        paidAmount,
        currentStep,
        setCurrentStep,
        loan: selectedLoan,
        setLoan: setSelectedLoan,
        collateralImageURL,
        setCollateralImageURL,
        paidTokenInput,
        setPaidTokenInput,
        successRolloverLoanHash,
        setSuccessRolloverLoanHash,
        rolloverCommitment,
        setRolloverCommitment,
        bidId,
        setBidId,
        successfulLoanParams,
        setSuccessfulRolloverParams,
        succesfulTxHash,
        setSuccesfulTxHash,
      }}
    >
      {children}
    </RepaySectionContext.Provider>
  );
};

export const useGetRepaySectionContext = () => {
  const context = useContext(RepaySectionContext);
  if (context === undefined) {
    throw new Error(
      "useGetRepaySectionContext must be used within a RepaySectionContextProvider"
    );
  }

  return context;
};
