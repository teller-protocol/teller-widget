import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { TokensContextProvider } from "../../contexts/UserTokensContext";
import { config } from "../../helpers/createWagmiConfig";
import Button from "../Button";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";

import WelcomeScreen from "../../pages/WelcomeScreen";
import "./widget.scss";

const queryClient = new QueryClient();

export type WhitelistedTokens = {
  [chainId: string]: string[];
};

interface BaseWidgetProps {
  buttonLabel?: string;
  whitelistedTokens?: WhitelistedTokens;
  buttonClassName?: string;
  isBareButton?: boolean;
  showModalByDefault?: boolean;
}

interface WhiteListedTokensRequiredProps extends BaseWidgetProps {
  showOnlyWhiteListedTokens: true;
  whitelistedTokens: WhitelistedTokens;
}

interface WhiteListedTokensOptionalProps extends BaseWidgetProps {
  showOnlyWhiteListedTokens?: false;
}

export type WidgetProps =
  | WhiteListedTokensRequiredProps
  | WhiteListedTokensOptionalProps;

const Widget: React.FC<WidgetProps> = ({
  buttonLabel = "Cash advance",
  whitelistedTokens,
  showOnlyWhiteListedTokens,
  buttonClassName,
  isBareButton,
  showModalByDefault,
}) => {
  const [showModal, setShowModal] = useState(showModalByDefault || false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(
    JSON.parse(
      localStorage.getItem("showTellerWidgetWelcomeScreen") ?? "true"
    ) as boolean
  );
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TokensContextProvider
          whitelistedTokens={whitelistedTokens}
          showOnlyWhiteListedTokens={showOnlyWhiteListedTokens}
        >
          <div className="teller-widget">
            <Modal
              closeModal={() => setShowModal(false)}
              showModal={showModal}
              isWelcomeScreen={showWelcomeScreen}
            >
              {showWelcomeScreen ? (
                <WelcomeScreen onClick={() => setShowWelcomeScreen(false)} />
              ) : (
                <ModalContent showModalByDefault={showModalByDefault} />
              )}
            </Modal>
            <Button
              label={buttonLabel}
              onClick={() => setShowModal(true)}
              className={buttonClassName}
              variant={isBareButton ? "bare" : "primary"}
            />
          </div>
        </TokensContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Widget;
