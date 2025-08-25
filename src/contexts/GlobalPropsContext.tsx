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
  LOOP = "LOOP",
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
  showLoopSection?: boolean;
  widgetAction?: WIDGET_ACTION_ENUM;
  setWidgetAction: (action: WIDGET_ACTION_ENUM) => void;
  isSwitchingBetweenWidgetActions: boolean;
  setIsSwitchingBetweenWidgetActions: (isSwitching: boolean) => void;
  isStrategiesSection: boolean;
  isLoopSection: boolean;
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
  cacheKey?: string;
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
  showLoopSection?: boolean;
  isVisible?: boolean;
  isTradeMode?: boolean;
  initialStrategyAction?: STRATEGY_ACTION_ENUM;
  strategyToken?: string;
  borrowToken?: string;
  principalTokenForPair?: string;
  isLoop?: boolean;
  cacheKey?: string;
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
  showLoopSection = false,
  isVisible = false,
  isTradeMode = false,
  initialStrategyAction,
  strategyToken,
  borrowToken,
  principalTokenForPair,
  isLoop = false,
  cacheKey,
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
  const isLoopSection = widgetAction === WIDGET_ACTION_ENUM.LOOP;

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
      if (!whitelistedTokens) return true;

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
      showLoopSection,
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
      isLoopSection,
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
      cacheKey,
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
    showLoopSection,
    widgetAction,
    isStrategiesSection,
    isLoopSection,
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
    cacheKey,
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
