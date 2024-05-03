import { useState } from "react";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";
import BorrowSection from "../../pages/BorrowSection";
import SelectButtons from "../SelectButtons";

enum WIDGET_ACTION_ENUM {
  BORROW = "BORROW",
  REPAY = "REPAY",
}

const selectOptions = [
  { value: WIDGET_ACTION_ENUM.BORROW, content: "Borrow" },
  { value: WIDGET_ACTION_ENUM.REPAY, content: "Repay" },
];

const ModalContent: React.FC = () => {
  const [widgetAction, setWidgetAction] = useState(WIDGET_ACTION_ENUM.BORROW);

  const mapOptionToComponent = {
    [WIDGET_ACTION_ENUM.BORROW]: <BorrowSection />,
    [WIDGET_ACTION_ENUM.REPAY]: <div>Repay</div>,
  };

  useGetProtocolFee();

  return (
    <>
      <SelectButtons
        items={selectOptions}
        value={widgetAction}
        onChange={setWidgetAction}
      />
      {mapOptionToComponent[widgetAction]}
    </>
  );
};

export default ModalContent;
