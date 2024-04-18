import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "../../helpers/createWagmiConfig";
import Button from "../Button";
import ConnectWalletButton from "../ConnectWalletButton";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";
import { TokensContextProvider } from "../../contexts/UserTokensContext";

import "./widget.scss";

const queryClient = new QueryClient();

export type AppTokens = {
  [chainId: string]: string[];
};

interface WidgetProps {
  buttonLabel?: string;
  tokenList?: AppTokens;
}

const Widget: React.FC<WidgetProps> = ({
  buttonLabel = "Cash advance",
  tokenList,
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TokensContextProvider tokens={tokenList}>
          <div className="teller-widget">
            <Modal closeModal={() => setShowModal(false)} showModal={showModal}>
              <ModalContent />
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
