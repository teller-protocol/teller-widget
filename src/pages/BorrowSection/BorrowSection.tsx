import { useMemo, useState } from "react";
import { useGetUserTokenContext } from "../../context/UserTokensContext";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";
import CollateralTokenList from "../../components/CollateralTokenList";
import "./borrowSection.scss";
import { UserToken } from "../../hooks/useGetUserTokens";
import OpportunitiesList from "./OpportunitiesList";
import {
  BorrowSectionContextProvider,
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "./BorrowSectionContext";

const RenderComponent: React.FC = () => {
  const { currentStep } = useGetBorrowSectionContext();
  const mapStepToComponent = useMemo(
    () => ({
      [BorrowSectionSteps.SELECT_TOKEN]: <CollateralTokenList />,
      [BorrowSectionSteps.SELECT_OPPORTUNITY]: <OpportunitiesList />,
      [BorrowSectionSteps.OPPORTUNITY_DETAILS]: <div>OPPORTUNITY_DETAILS</div>,
      [BorrowSectionSteps.SUCCESS]: <div>SUCCESS</div>,
    }),
    []
  );

  return (
    <div className="borrow-section">{mapStepToComponent[currentStep]}</div>
  );
};

const BorrowSection: React.FC = () => {
  return (
    <BorrowSectionContextProvider>
      <RenderComponent />
    </BorrowSectionContextProvider>
  );
};

export default BorrowSection;
