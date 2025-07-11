import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Address } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { WhitelistedTokens } from "../components/Widget/Widget";
import { UserToken, useGetUserTokens } from "../hooks/useGetUserTokens";

export enum WIDGET_ACTION_ENUM {
  BORROW = "BORROW",
  REPAY = "REPAY",
  POOL = "POOL",
  STRATEGIES = "STRATEGIES",
}

export enum STRATEGY_ACTION_ENUM {
  LONG = "LONG",
  SHORT = "SHORT",
  FARM = "FARM",
}

export type GlobalPropsContextType = {
  userTokens: UserToken[];
  isLoading: boolean;
  whitelistedChainTokens: string[];
  isWhitelistedToken: (token: Address | undefined) => boolean | undefined;
  whitelistedChains?: number[];
  referralFee?: number;
  referralAddress?: string;
  buttonColorPrimary?: string;
  buttonTextColorPrimary?: string;
  subgraphApiKey: string;
  singleWhitelistedToken?: string;
  showPoolSection?: boolean;
  showRepaySection?: boolean;
  widgetAction?: WIDGET_ACTION_ENUM;
  setWidgetAction: (action: WIDGET_ACTION_ENUM) => void;
  isSwitchingBetweenWidgetActions: boolean;
  setIsSwitchingBetweenWidgetActions: (isSwitching: boolean) => void;
  isStrategiesSection: boolean;
  strategyAction?: STRATEGY_ACTION_ENUM;
  setStrategyAction: (action: STRATEGY_ACTION_ENUM) => void;
  whitelistedTokens?: WhitelistedTokens;
  isTradeMode?: boolean;
  strategyToken?: string;
  borrowToken?: string;
  principalTokenForPair?: string;
  isLoop?: boolean;
  switchChainManual: (chainId?: number, resetSelections?: boolean) => void;
  shouldResetSelections: boolean;
};

interface GlobalPropsContextProps {
  children: React.ReactNode;
  whitelistedTokens?: WhitelistedTokens;
  showOnlyWhiteListedTokens?: boolean;
  whitelistedChains?: number[];
  referralFee?: number;
  referralAddress?: string;
  buttonColorPrimary?: string;
  buttonTextColorPrimary?: string;
  subgraphApiKey: string;
  singleWhitelistedToken?: string;
  showPoolSection?: boolean;
  showRepaySection?: boolean;
  isVisible?: boolean;
  isTradeMode?: boolean;
  initialStrategyAction?: STRATEGY_ACTION_ENUM;
  strategyToken?: string;
  borrowToken?: string;
  principalTokenForPair?: string;
  isLoop?: boolean;
}

const GlobalPropsContext = createContext({} as GlobalPropsContextType);

export const GlobalContextProvider: React.FC<GlobalPropsContextProps> = ({
  children,
  whitelistedTokens,
  showOnlyWhiteListedTokens,
  whitelistedChains,
  referralFee,
  referralAddress,
  buttonColorPrimary = undefined,
  buttonTextColorPrimary = undefined,
  subgraphApiKey,
  singleWhitelistedToken,
  showPoolSection = false,
  showRepaySection = true,
  isVisible = false,
  isTradeMode = false,
  initialStrategyAction,
  strategyToken,
  borrowToken,
  principalTokenForPair,
  isLoop = false,
}) => {
  const { address } = useAccount();
  const chainId = useChainId();

  const prevWhitelistedChainTokensRef = useRef<string[]>([]);

  const whitelistedChainTokens = useMemo(() => {
    let newTokens: string[];
    if (!address) {
      newTokens = [];
    } else {
      newTokens =
        whitelistedTokens?.[chainId]?.map((token) => token.toLowerCase()) ?? [];
    }

    if (
      newTokens.length === prevWhitelistedChainTokensRef.current.length &&
      newTokens.every(
        (val, index) => val === prevWhitelistedChainTokensRef.current[index]
      )
    ) {
      return prevWhitelistedChainTokensRef.current;
    }

    prevWhitelistedChainTokensRef.current = newTokens;
    return newTokens;
  }, [address, whitelistedTokens, chainId]);

  const { userTokens, isLoading } = useGetUserTokens(
    whitelistedChainTokens,
    showOnlyWhiteListedTokens,
    !isVisible || !address
  );

  const [isSwitchingBetweenWidgetActions, setIsSwitchingBetweenWidgetActions] =
    useState(true);
  const [widgetAction, setWidgetAction] = useState<WIDGET_ACTION_ENUM>(
    isTradeMode ? WIDGET_ACTION_ENUM.STRATEGIES : WIDGET_ACTION_ENUM.BORROW
  );
  const isStrategiesSection = widgetAction === WIDGET_ACTION_ENUM.STRATEGIES;

  const [strategyAction, setStrategyAction] = useState<STRATEGY_ACTION_ENUM>(
    initialStrategyAction || STRATEGY_ACTION_ENUM.LONG
  );

  useEffect(() => {
    if (initialStrategyAction) {
      setStrategyAction(initialStrategyAction);
    }
  }, [initialStrategyAction]);

  const isWhitelistedToken = useCallback(
    (token?: Address | undefined) => {
      const result = token
        ? whitelistedTokens?.[chainId]?.includes(token)
        : false;
      return result;
    },
    [chainId, whitelistedTokens]
  );

  const { switchChain } = useSwitchChain();
  const [shouldResetSelections, setShouldResetSelections] = useState(false);
  const switchChainManual = useCallback(
    (toChainId?: number, resetSelections?: boolean) => {
      if (chainId !== (toChainId || 1)) {
        setShouldResetSelections(resetSelections || false);
        setTimeout(() => {
          switchChain({ chainId: toChainId || 1 });
        });
      }
    },
    [switchChain, chainId]
  );

  const contextValue = useMemo(() => {
    return {
      userTokens,
      isLoading,
      isWhitelistedToken,
      whitelistedChainTokens,
      whitelistedChains,
      referralFee,
      referralAddress,
      buttonColorPrimary,
      buttonTextColorPrimary,
      subgraphApiKey,
      singleWhitelistedToken,
      showPoolSection,
      showRepaySection,
      widgetAction,
      setWidgetAction: (action: WIDGET_ACTION_ENUM) => {
        setIsSwitchingBetweenWidgetActions(action !== widgetAction);
        setTimeout(() => {
          setWidgetAction(action);
        });
      },
      setIsSwitchingBetweenWidgetActions,
      isSwitchingBetweenWidgetActions,
      isStrategiesSection,
      strategyAction,
      setStrategyAction,
      whitelistedTokens,
      isTradeMode,
      strategyToken,
      borrowToken,
      principalTokenForPair,
      isLoop,
      shouldResetSelections,
      switchChainManual,
    };
  }, [
    userTokens,
    isLoading,
    isWhitelistedToken,
    whitelistedChainTokens,
    whitelistedChains,
    referralFee,
    referralAddress,
    buttonColorPrimary,
    buttonTextColorPrimary,
    subgraphApiKey,
    singleWhitelistedToken,
    showPoolSection,
    showRepaySection,
    widgetAction,
    isStrategiesSection,
    strategyAction,
    whitelistedTokens,
    isTradeMode,
    strategyToken,
    borrowToken,
    principalTokenForPair,
    isLoop,
    isSwitchingBetweenWidgetActions,
    shouldResetSelections,
    switchChainManual,
  ]);

  return (
    <GlobalPropsContext.Provider value={contextValue}>
      {children}
    </GlobalPropsContext.Provider>
  );
};

export const useGetGlobalPropsContext = () => {
  const context = useContext(GlobalPropsContext);
  if (context === undefined) {
    throw new Error(
      "useGetGlobalPropsContext must be used within a UserTokensContextProvider"
    );
  }
  return context;
};
