import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { GlobalContextProvider } from "../../contexts/GlobalPropsContext";
import { config } from "../../helpers/createWagmiConfig";
import Button from "../Button";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";

import { TransactionButtonProvider } from "../../contexts/TransactionButtonContext";
import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";
import WelcomeScreen from "../../pages/WelcomeScreen";
import "./widget.scss";

export const queryClient = new QueryClient();

export type WhitelistedTokens = {
  [chainId: string]: string[];
};

interface BaseWidgetProps {
  buttonLabel?: string;
  buttonColorPrimary?: string;
  buttonTextColorPrimary?: string;
  whitelistedTokens?: WhitelistedTokens;
  buttonClassName?: string;
  isBareButton?: boolean;
  showModalByDefault?: boolean;
  whitelistedChains?: number[];
  useLightLogo?: boolean;
  referralFee?: number;
  referralAddress?: string;
  welcomeScreenLogo?: string;
  welcomeScreenTitle?: string;
  welcomeScreenParagraph?: string;
  subgraphApiKey: string;
  isEmbedded?: boolean;
  showChainSwitch?: boolean;
  singleWhitelistedToken?: string;
  showStrategiesSection?: boolean;
  showPoolSection?: boolean;
  showRepaySection?: boolean;
  hideAutoConnectModal?: boolean;
  widgetChainId?: number;
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
  buttonColorPrimary,
  buttonTextColorPrimary,
  whitelistedTokens,
  showOnlyWhiteListedTokens,
  buttonClassName,
  isBareButton,
  showModalByDefault,
  whitelistedChains,
  useLightLogo,
  referralFee = 0,
  referralAddress = "0x193C83873843CA7a170490d3752BCcB678365d57", // need a non-zero address
  welcomeScreenLogo,
  welcomeScreenTitle,
  welcomeScreenParagraph,
  subgraphApiKey,
  isEmbedded = false,
  showChainSwitch = true,
  singleWhitelistedToken,
  showStrategiesSection,
  showPoolSection = false,
  showRepaySection = true,
  hideAutoConnectModal,
  widgetChainId,
}) => {
  const [showModal, setShowModal] = useState(showModalByDefault || false);

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(
    JSON.parse(
      getItemFromLocalStorage("showTellerWidgetWelcomeScreen") || "true"
    ) as boolean
  );

  if (referralFee > 500) {
    console.warn("Referral fee set to maximum at 5%.");
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GlobalContextProvider
          whitelistedTokens={whitelistedTokens}
          showOnlyWhiteListedTokens={showOnlyWhiteListedTokens}
          whitelistedChains={whitelistedChains}
          referralFee={Math.min(referralFee, 500)}
          referralAddress={referralAddress}
          buttonColorPrimary={buttonColorPrimary}
          buttonTextColorPrimary={buttonTextColorPrimary}
          subgraphApiKey={subgraphApiKey}
          singleWhitelistedToken={singleWhitelistedToken}
          isVisible={showModal || isEmbedded}
        >
          <TransactionButtonProvider>
            <div className="teller-widget">
              <Modal
                {...(!isEmbedded && {
                  closeModal: () => setShowModal(false),
                  showModal,
                })}
                isWelcomeScreen={showWelcomeScreen}
                useLightLogo={useLightLogo}
                isEmbedded={isEmbedded}
                showChainSwitch={showChainSwitch}
                widgetChainId={widgetChainId}
              >
                {showWelcomeScreen ? (
                  <WelcomeScreen
                    onClick={() => setShowWelcomeScreen(false)}
                    welcomeScreenLogo={welcomeScreenLogo}
                    welcomeScreenTitle={welcomeScreenTitle}
                    welcomeScreenParagraph={welcomeScreenParagraph}
                  />
                ) : (
                  <ModalContent
                    showModalByDefault={showModalByDefault}
                    showPoolSection={showPoolSection}
                    showRepaySection={showRepaySection}
                    showStrategiesSection={showStrategiesSection}
                    hideAutoConnectModal={hideAutoConnectModal}
                  />
                )}
              </Modal>
              {!isEmbedded && (
                <Button
                  label={buttonLabel}
                  onClick={() => setShowModal(true)}
                  className={buttonClassName}
                  variant={isBareButton ? "bare" : "primary"}
                />
              )}
            </div>
          </TransactionButtonProvider>
        </GlobalContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Widget;
