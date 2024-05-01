import { useMemo } from "react";
import Loans from "./Loans";
import {
  RepaySectionContextProvider,
  RepaySectionSteps,
  useGetRepaySectionContext,
} from "./RepaySectionContext";

import "./repaySection.scss";
import PayLoan from "./PayLoan";
import { PaymentConfirmation } from "./PaymentConfirmation/PaymentConfirmation";

const RenderComponent: React.FC = () => {
  const { currentStep } = useGetRepaySectionContext();
  const mapStepToComponent = useMemo(
    () => ({
      [RepaySectionSteps.LOANS]: <Loans />,
      [RepaySectionSteps.REPAY_LOAN]: <PayLoan />,
      [RepaySectionSteps.ROLLOVER_LOAN]: "<RolloverLoan />",
      [RepaySectionSteps.CONFIRMATION]: <PaymentConfirmation />,
    }),
    []
  );

  return <div className="repay-section">{mapStepToComponent[currentStep]}</div>;
};

const RepaySection = () => {
  return (
    <RepaySectionContextProvider>
      <RenderComponent />
    </RepaySectionContextProvider>
  );
};

export default RepaySection;
