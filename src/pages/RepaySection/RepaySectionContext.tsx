import React, { createContext, useContext, useState } from "react";
import { useConfig } from "wagmi";

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
  const [paidAmount, setPaidAmount] = useState<string>("");

  return (
    <RepaySectionContext.Provider
      value={{
        paidAmount,
        currentStep,
        setCurrentStep,
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
