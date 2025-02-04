import { useMemo, useEffect } from "react";
import { useChainId } from "wagmi";
import BorrowerTerms from "./BorrowerTerms";
import {
  BorrowSectionContextProvider,
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "./BorrowSectionContext";
import CollateralTokenList from "./CollateralTokenList";
import OpportunitiesList from "./OpportunitiesList";
import OpportunityDetails from "./OpportunityDetails";
import "./borrowSection.scss";
import BorrowConfirmation from "./BorrowConfirmation";
import AddToCalendar from "../../components/AddToCalendar";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

const RenderComponent: React.FC = () => {
  const { whitelistedChainTokens } = useGetGlobalPropsContext();
  const { currentStep, setCurrentStep, bidId } = useGetBorrowSectionContext();
  const chainId = useChainId();
  const mapStepToComponent = useMemo(
    () => ({
      [BorrowSectionSteps.SELECT_TOKEN]: <CollateralTokenList />,
      [BorrowSectionSteps.SELECT_OPPORTUNITY]: <OpportunitiesList />,
      [BorrowSectionSteps.OPPORTUNITY_DETAILS]: <OpportunityDetails />,
      [BorrowSectionSteps.ACCEPT_TERMS]: <BorrowerTerms />,
      [BorrowSectionSteps.SUCCESS]: <BorrowConfirmation />,
      [BorrowSectionSteps.ADD_TO_CALENDAR]: (
        <AddToCalendar
          bidId={bidId}
          onBack={() => setCurrentStep(BorrowSectionSteps.SUCCESS)}
        />
      ),
    }),
    [bidId, setCurrentStep]
  );

  useEffect(() => {
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
  }, [chainId, setCurrentStep, whitelistedChainTokens]);

  return (
    <div className="borrow-section">{mapStepToComponent[currentStep]}</div>
  );
};

const BorrowSection: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  const { setCurrentStep } = useGetBorrowSectionContext();

  useEffect(() => {
    if (isActive) {
      setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    }
  }, [isActive, setCurrentStep]);

  return (
    <BorrowSectionContextProvider>
      <RenderComponent />
    </BorrowSectionContextProvider>
  );
};

export default BorrowSection;
