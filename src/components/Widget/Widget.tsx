import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "../../helpers/createWagmiConfig";
import Button from "../Button";
import ConnectWalletButton from "../ConnectWalletButton";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";
import "./widget.scss";
import { UserTokensContextProvider } from "../../context/UserTokensContext";

const queryClient = new QueryClient();

interface WidgetProps {
  buttonLabel?: string;
}

const Widget: React.FC<WidgetProps> = ({ buttonLabel = "Cash advance" }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <UserTokensContextProvider>
          <div className="teller-widget">
            <Modal closeModal={() => setShowModal(false)} showModal={showModal}>
              <ModalContent />
            </Modal>
            <ConnectWalletButton />
            <Button label={buttonLabel} onClick={() => setShowModal(true)} />
          </div>
        </UserTokensContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Widget;
