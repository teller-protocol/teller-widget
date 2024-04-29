import React, { createContext, useContext, useState } from "react";
import { useConfig } from "wagmi";
import { Loan } from "../../hooks/queries/useGetActiveLoansForUser";

export enum RepaySectionSteps {
  LOANS,
  REPAY_LOAN,
  ROLLOVER_LOAN,
  CONFIRMATION,
}

interface RepaySectionContextType {
  paidAmount: string;
  currentStep: RepaySectionSteps;
  setCurrentStep: (step: RepaySectionSteps) => void;
  loan: Loan;
  setLoan: (loan: Loan) => void;
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

  return (
    <RepaySectionContext.Provider
      value={{
        paidAmount,
        currentStep,
        setCurrentStep,
        loan: selectedLoan,
        setLoan: setSelectedLoan,
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
