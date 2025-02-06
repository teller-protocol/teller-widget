import { useMemo, useEffect } from "react";
import { useChainId } from "wagmi";
import RolloverLoan from "../RolloverLoan";

import Loans from "./Loans";
import PayLoan from "./PayLoan";
import { PaymentConfirmation } from "./PaymentConfirmation/PaymentConfirmation";
import {
  RepaySectionContextProvider,
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "./RepaySectionContext";
import "./repaySection.scss";
import RolloverConfirmation from "./RolloverConfirmation";
import AddToCalendar from "../../components/AddToCalendar";

const RenderComponent: React.FC = () => {
  const { currentStep, bidId, setCurrentStep } = useGetRepaySectionContext();
  const chainId = useChainId();
  const mapStepToComponent = useMemo(
    () => ({
      [RepaySectionSteps.LOANS]: <Loans />,
      [RepaySectionSteps.REPAY_LOAN]: <PayLoan />,
      [RepaySectionSteps.ROLLOVER_LOAN]: <RolloverLoan />,
      [RepaySectionSteps.CONFIRMATION]: <PaymentConfirmation />,
      [RepaySectionSteps.ROLLOVER_CONFIRMATION]: <RolloverConfirmation />,
      [RepaySectionSteps.ADD_ROLLOVER_TO_CALENDAR]: (
        <AddToCalendar
          bidId={bidId}
          onBack={() => setCurrentStep(RepaySectionSteps.CONFIRMATION)}
        />
      ),
    }),
    []
  );

  useEffect(() => {
    setCurrentStep(RepaySectionSteps.LOANS);
  }, [chainId]);

  return <div className="repay-section">{mapStepToComponent[currentStep]}</div>;
};

const RepaySection = () => {
  const chainId = useChainId();
  return (
    <RepaySectionContextProvider>
      <RenderComponent key={chainId} />
    </RepaySectionContextProvider>
  );
};

export default RepaySection;
