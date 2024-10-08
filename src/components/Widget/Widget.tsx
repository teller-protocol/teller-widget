import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { GlobalContextProvider } from "../../contexts/GlobalPropsContext";
import { config } from "../../helpers/createWagmiConfig";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";
import WelcomeScreen from "../../pages/WelcomeScreen";
import "./widget.scss";
import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";

const queryClient = new QueryClient();

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
}) => {
  // State for managing the welcome screen visibility
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
        >
          <div className="teller-widget">
            <Modal isWelcomeScreen={showWelcomeScreen} useLightLogo={useLightLogo}>
              {showWelcomeScreen ? (
                <WelcomeScreen
                  onClick={() => setShowWelcomeScreen(false)}
                  welcomeScreenLogo={welcomeScreenLogo}
                  welcomeScreenTitle={welcomeScreenTitle}
                  welcomeScreenParagraph={welcomeScreenParagraph}
                />
              ) : (
                <ModalContent showModalByDefault={showModalByDefault} />
              )}
            </Modal>
          </div>
        </GlobalContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Widget;
