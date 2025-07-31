import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  GlobalContextProvider,
  STRATEGY_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";
import Button from "../Button";
import Modal from "../Modal/Modal";
import ModalContent from "../ModalContent";

import { TransactionButtonProvider } from "../../contexts/TransactionButtonContext";
import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";
import WelcomeScreen from "../../pages/WelcomeScreen";
import "./widget.scss";
import { useAccount, useBlockNumber } from "wagmi";
import { encodeFunctionData } from "viem";

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
  isTradeMode?: boolean;
  strategy?: STRATEGY_ACTION_ENUM.LONG | STRATEGY_ACTION_ENUM.SHORT;
  strategyToken?: string;
  borrowToken?: string;
  principalTokenForPair?: string;
  isLoop?: boolean;
  cacheKey?: string;
  atmId?: string;
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

const TxErrorWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { chain } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const { address } = useAccount();

  const errLog = console.error;
  console.error = (...args) => {
    const err = args[0];
    const data = args[1];

    if (err && String(err).includes("contract") && data.abi) {
      const functionData = encodeFunctionData({
        abi: data.abi,
        functionName: data.functionName,
        args: data.args,
      });
      console.group("Transaction Error");

      console.group("Tenderly Simulation Link");
      console.log(
        `https://dashboard.tenderly.co/teller/v2/simulator/new?block=${blockNumber}&from=${address}&contractAddress=${data.contractAddress}&rawFunctionInput=${functionData}&network=${chain?.id}&blockIndex=0&gas=8000000&gasPrice=0&value=0&headerBlockNumber=&headerTimestamp=`
      );
      console.groupEnd();

      console.warn(err);

      console.groupEnd();

      return;
    }

    errLog(...args);
  };

  return <>{children}</>;
};

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
  isTradeMode,
  strategy,
  strategyToken,
  borrowToken,
  principalTokenForPair,
  isLoop = false,
  cacheKey,
  atmId = "",
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

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["teller-widget"] });
    };
  }, []);

  return (
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
        isTradeMode={isTradeMode}
        initialStrategyAction={strategy}
        strategyToken={strategyToken}
        borrowToken={borrowToken}
        principalTokenForPair={principalTokenForPair}
        isLoop={isLoop}
        cacheKey={cacheKey}
        atmId={atmId}
      >
        <TxErrorWrapper>
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
        </TxErrorWrapper>
      </GlobalContextProvider>
    </QueryClientProvider>
  );
};

export default Widget;
