import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

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
  isWhitelistedToken: (token: Address | undefined) => boolean;
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
  isStrategiesSection: boolean;
  strategyAction?: STRATEGY_ACTION_ENUM;
  setStrategyAction: (action: STRATEGY_ACTION_ENUM) => void;
  whitelistedTokens?: WhitelistedTokens;
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
}) => {
  const [_userTokens, setUserTokens] = useState<any[]>([]);
  const { address } = useAccount();
  const chainId = useChainId();

  const whitelistedChainTokens = useMemo(() => {
    if (!address) return [];
    return (
      whitelistedTokens?.[chainId]?.map((token) => token.toLowerCase()) ?? []
    );
  }, [whitelistedTokens, chainId, address]);

  const { userTokens, isLoading } = useGetUserTokens(
    whitelistedChainTokens,
    showOnlyWhiteListedTokens,
    !isVisible || !address
  );

  const [widgetAction, setWidgetAction] = useState<WIDGET_ACTION_ENUM>(
    WIDGET_ACTION_ENUM.BORROW
  );
  const isStrategiesSection = widgetAction === WIDGET_ACTION_ENUM.STRATEGIES;

  const [strategyAction, setStrategyAction] = useState<STRATEGY_ACTION_ENUM>(
    STRATEGY_ACTION_ENUM.LONG
  );

  useEffect(() => {
    let mounted = true;
    if (_userTokens?.length > 0) return;
    if (mounted) {
      setUserTokens(userTokens);
    }
    return () => {
      mounted = false;
    };
  }, [_userTokens?.length, userTokens]);

  useEffect(() => {
    setUserTokens([]);
  }, [chainId]);

  const isWhitelistedToken = useCallback(
    (token?: Address | undefined) =>
      token ? whitelistedChainTokens.includes(token) : false,
    [whitelistedChainTokens]
  );

  const contextValue = useMemo(
    () => ({
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
      setWidgetAction,
      isStrategiesSection,
      strategyAction,
      setStrategyAction,
      whitelistedTokens,
    }),
    [
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
      setWidgetAction,
      isStrategiesSection,
      strategyAction,
      setStrategyAction,
      whitelistedTokens,
    ]
  );

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
