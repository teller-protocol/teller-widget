import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useChainId } from "wagmi";
import { WhitelistedTokens } from "../components/Widget/Widget";
import { UserToken, useGetUserTokens } from "../hooks/useGetUserTokens";

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
}) => {
  const [_userTokens, setUserTokens] = useState<any[]>([]);
  const chainId = useChainId();

  const whitelistedChainTokens = useMemo(
    () => whitelistedTokens?.[chainId] ?? [],
    [whitelistedTokens, chainId]
  );

  const { userTokens, isLoading } = useGetUserTokens(
    whitelistedChainTokens,
    showOnlyWhiteListedTokens
  );

  useEffect(() => {
    if (_userTokens?.length > 0) return;
    setUserTokens(userTokens);
  }, [_userTokens?.length, userTokens]);

  useEffect(() => {
    setUserTokens([]);
  }, [chainId]);

  const isWhitelistedToken = (token?: Address | undefined) =>
    token ? whitelistedChainTokens.includes(token) : false;

  return (
    <GlobalPropsContext.Provider
      value={{
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
      }}
    >
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