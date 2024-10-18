import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useGetProtocolFee } from "../../hooks/useGetProtocolFee";
import BorrowSection from "../../pages/BorrowSection";
import RepaySection from "../../pages/RepaySection";
import SelectButtons from "../SelectButtons";
import WelcomeScreen from "../../pages/WelcomeScreen";
import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";

enum WIDGET_ACTION_ENUM {
  BORROW = "BORROW",
  REPAY = "REPAY",
}

const selectOptions = [
  { value: WIDGET_ACTION_ENUM.BORROW, content: "Borrow" },
  { value: WIDGET_ACTION_ENUM.REPAY, content: "Repay" },
];

interface ModalContentProps {
  showModalByDefault?: boolean;
  showWelcomeScreenOverride?: boolean;
  welcomeScreenLogo?: string;
  welcomeScreenTitle?: string;
  welcomeScreenParagraph?: string;
  closeModal?: () => void;
  onClick?: () => void;
  isEmbedded?: boolean;
}

const ModalContent: React.FC<ModalContentProps> = ({
  showModalByDefault,
  showWelcomeScreenOverride,
  welcomeScreenLogo,
  welcomeScreenTitle,
  welcomeScreenParagraph,
  closeModal,
  isEmbedded,
}) => {
  const [widgetAction, setWidgetAction] = useState(WIDGET_ACTION_ENUM.BORROW);

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(
    showWelcomeScreenOverride ||
      (JSON.parse(
        getItemFromLocalStorage("showTellerWidgetWelcomeScreen") || "true"
      ) as boolean)
  );

  const mapOptionToComponent = {
    [WIDGET_ACTION_ENUM.BORROW]: <BorrowSection />,
    [WIDGET_ACTION_ENUM.REPAY]: <RepaySection />,
  };

  useGetProtocolFee();

  const { connect } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected && !showModalByDefault) connect({ connector: injected() });
  }, [connect, isConnected, showModalByDefault]);

  return (
    <>
      {showWelcomeScreen && (
        <WelcomeScreen
          onClick={() => setShowWelcomeScreen(false)}
          welcomeScreenLogo={welcomeScreenLogo}
          welcomeScreenTitle={welcomeScreenTitle}
          welcomeScreenParagraph={welcomeScreenParagraph}
          handleClose={closeModal}
          isEmbedded={isEmbedded}
        />
      )}
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
