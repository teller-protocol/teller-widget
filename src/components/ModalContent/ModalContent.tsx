import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  useGetGlobalPropsContext,
  WIDGET_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";
import { useTransactionButton } from "../../contexts/TransactionButtonContext";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";
import useIsMobile from "../../hooks/useIsMobile";
import BorrowSection from "../../pages/BorrowSection";
import PoolSection from "../../pages/PoolSection";
import RepaySection from "../../pages/RepaySection";
import SelectButtons from "../SelectButtons";

interface ModalContentProps {
  showModalByDefault?: boolean;
  showPoolSection?: boolean;
  showRepaySection?: boolean;
  showStrategiesSection?: boolean;
  hideAutoConnectModal?: boolean;
}

const ModalContent: React.FC<ModalContentProps> = ({
  showModalByDefault,
  showPoolSection,
  showRepaySection,
  showStrategiesSection,
  hideAutoConnectModal = false,
}) => {
  const { widgetAction, setWidgetAction, isTradeMode } =
    useGetGlobalPropsContext();
  const [key, setKey] = useState(0);
  const isMobile = useIsMobile();
  const { isTransactionButtonPresent } = useTransactionButton();

  const hideNavBar = isTradeMode || (isMobile && isTransactionButtonPresent);

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
    if (!isConnected && !showModalByDefault && !hideAutoConnectModal)
      connect({ connector: injected() });
  }, [connect, hideAutoConnectModal, isConnected, showModalByDefault]);

  return (
    <>
      {!hideNavBar && (
        <SelectButtons
          items={selectOptions}
          value={widgetAction ?? ""}
          onChange={handleWidgetAction}
        />
      )}
      {mapOptionToComponent[widgetAction as WIDGET_ACTION_ENUM]}
    </>
  );
};

export default ModalContent;
