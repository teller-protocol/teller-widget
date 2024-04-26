import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { TokensContextProvider } from "../../contexts/UserTokensContext";
import { config } from "../../helpers/createWagmiConfig";
import Button from "../Button";
import ConnectWalletButton from "../ConnectWalletButton";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";

import WelcomeScreen from "../../pages/WelcomeScreen";
import "./widget.scss";

const queryClient = new QueryClient();

export type WhitelistedTokens = {
  [chainId: string]: string[];
};

interface WidgetProps {
  buttonLabel?: string;
  whitelistedTokens?: WhitelistedTokens;
  showOnlyWhiteListedTokens?: boolean;
}

const Widget: React.FC<WidgetProps> = ({
  buttonLabel = "Cash advance",
  whitelistedTokens,
  showOnlyWhiteListedTokens,
}) => {
  const [showModal, setShowModal] = useState(false);
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
                <ModalContent />
              )}
            </Modal>
            <ConnectWalletButton />
            <Button label={buttonLabel} onClick={() => setShowModal(true)} />
          </div>
        </TokensContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Widget;
