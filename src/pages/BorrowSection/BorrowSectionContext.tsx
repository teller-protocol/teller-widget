import { createContext, useContext, useState } from "react";
import { UserToken } from "../../hooks/useGetUserTokens";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";

export enum BorrowSectionSteps {
  SELECT_TOKEN,
  SELECT_OPPORTUNITY,
  OPPORTUNITY_DETAILS,
  SUCCESS,
}

export type BorrowSectionContextType = {
  currentStep: BorrowSectionSteps;
  setCurrentStep: (step: BorrowSectionSteps) => void;
  selectedCollateralToken?: UserToken;
  setSelectedCollateralToken: (token: UserToken) => void;
  selectedOpportunity: any;
  setSelectedOpportunity: (opportunity: any) => void;
  onCollateralTokenSelected: (token: UserToken) => void;
  onOpportunitySelected: (opportunity: any) => void;
  tokensWithCommitments: UserToken[];
  tokensWithCommitmentsLoading: boolean;
};

interface BorrowSectionContextProps {
  children: React.ReactNode;
}

const BorrowSectionContext = createContext<BorrowSectionContextType>(
  {} as BorrowSectionContextType
);

export const BorrowSectionContextProvider: React.FC<
  BorrowSectionContextProps
> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<BorrowSectionSteps>(
    BorrowSectionSteps.SELECT_TOKEN
  );

  const [selectedCollateralToken, setSelectedCollateralToken] =
    useState<UserToken>();

  const { tokensWithCommitments, loading: tokensWithCommitmentsLoading } =
    useGetCommitmentsForUserTokens();

  return (
    <BorrowSectionContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedCollateralToken,
        setSelectedCollateralToken,
        tokensWithCommitments,
        tokensWithCommitmentsLoading,
        // selectedOpportunity,
        // setSelectedOpportunity,
        // onCollateralTokenSelected,
        // onOpportunitySelected,
        // mapStepToComponent,
      }}
    >
      {children}
    </BorrowSectionContext.Provider>
  );
};

export const useGetBorrowSectionContext = () => {
  const context = useContext(BorrowSectionContext);
  if (context === undefined) {
    throw new Error(
      "useGetBorrowSectionContext must be used within a BorrowSectionContextProvider"
    );
  }

  return context;
};