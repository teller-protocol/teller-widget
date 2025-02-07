import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";
import BorrowSection from "../../pages/BorrowSection";
import RepaySection from "../../pages/RepaySection";
import PoolSection from "../../pages/PoolSection";
import SelectButtons from "../SelectButtons";

enum WIDGET_ACTION_ENUM {
  BORROW = "BORROW",
  REPAY = "REPAY",
  POOL = "POOL",
}

const selectOptions = [
  { value: WIDGET_ACTION_ENUM.BORROW, content: "Borrow" },
  { value: WIDGET_ACTION_ENUM.REPAY, content: "Repay" },
];

interface ModalContentProps {
  showModalByDefault?: boolean;
  showPoolSection?: boolean;
}

const ModalContent: React.FC<ModalContentProps> = ({ showModalByDefault, showPoolSection }) => {
  const [widgetAction, setWidgetAction] = useState(WIDGET_ACTION_ENUM.BORROW);
  const [key, setKey] = useState(0);

  console.log("showPoolSection", showPoolSection)

  showPoolSection && selectOptions.push({ value: WIDGET_ACTION_ENUM.POOL, content: "POOL" });

  const handleWidgetAction = (action: WIDGET_ACTION_ENUM) => {
    if (action === widgetAction && action === WIDGET_ACTION_ENUM.BORROW) {
      setKey(prev => prev + 1);
    }
    setWidgetAction(action);
  };

  const mapOptionToComponent = {
    [WIDGET_ACTION_ENUM.BORROW]: <BorrowSection key={key} />,
    [WIDGET_ACTION_ENUM.REPAY]: <RepaySection />,
    [WIDGET_ACTION_ENUM.POOL]: <PoolSection />,
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
        value={widgetAction}
        onChange={handleWidgetAction}
      />
      {mapOptionToComponent[widgetAction]}
    </>
  );
};

export default ModalContent;
