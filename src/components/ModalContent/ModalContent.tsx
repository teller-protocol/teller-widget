import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";
import BorrowSection from "../../pages/BorrowSection";
import RepaySection from "../../pages/RepaySection";
import PoolSection from "../../pages/PoolSection";
import SelectButtons from "../SelectButtons";
import {
  useGetGlobalPropsContext,
  WIDGET_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";

interface ModalContentProps {
  showModalByDefault?: boolean;
  showPoolSection?: boolean;
  showRepaySection?: boolean;
  showStrategiesSection?: boolean;
}

const ModalContent: React.FC<ModalContentProps> = ({
  showModalByDefault,
  showPoolSection,
  showRepaySection,
  showStrategiesSection,
}) => {
  const { widgetAction, setWidgetAction } = useGetGlobalPropsContext();
  const [key, setKey] = useState(0);

  const selectOptions = [
    { value: WIDGET_ACTION_ENUM.BORROW, content: "Borrow" },
    ...(showStrategiesSection
      ? [{ value: WIDGET_ACTION_ENUM.STRATEGIES, content: "Strategies" }]
      : []),
    ...(showRepaySection
      ? [{ value: WIDGET_ACTION_ENUM.REPAY, content: "My Loans" }]
      : []),
    ...(showPoolSection
      ? [{ value: WIDGET_ACTION_ENUM.POOL, content: "Pools" }]
      : []),
  ];

  const handleWidgetAction = (action: WIDGET_ACTION_ENUM) => {
    setKey((prev) => prev + 1);
    setWidgetAction(action);
  };

  const mapOptionToComponent = {
    [WIDGET_ACTION_ENUM.BORROW]: <BorrowSection key={key} />,
    [WIDGET_ACTION_ENUM.REPAY]: <RepaySection key={key} />,
    [WIDGET_ACTION_ENUM.POOL]: <PoolSection />,
    [WIDGET_ACTION_ENUM.STRATEGIES]: <BorrowSection key={key} />,
  };

  useGetProtocolFee();

  const { connect } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected && !showModalByDefault) connect({ connector: injected() });
  }, [connect, isConnected, showModalByDefault]);

  return (
    <>
      <SelectButtons
        items={selectOptions}
        value={widgetAction ?? ""}
        onChange={handleWidgetAction}
      />
      {mapOptionToComponent[widgetAction as WIDGET_ACTION_ENUM]}
    </>
  );
};

export default ModalContent;
