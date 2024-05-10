import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UserToken, useGetUserTokens } from "../hooks/useGetUserTokens";
import { WhitelistedTokens } from "../components/Widget/Widget";
import { useChainId } from "wagmi";
import { Address } from "viem";

export type TokensContextType = {
  userTokens: UserToken[];
  isLoading: boolean;
  whitelistedChainTokens: string[];
  isWhitelistedToken: (token: Address | undefined) => boolean;
};

interface TokensContextProps {
  children: React.ReactNode;
  whitelistedTokens?: WhitelistedTokens;
  showOnlyWhiteListedTokens?: boolean;
}

const UserTokensContext = createContext({} as TokensContextType);

export const TokensContextProvider: React.FC<TokensContextProps> = ({
  children,
  whitelistedTokens,
  showOnlyWhiteListedTokens,
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
    <UserTokensContext.Provider
      value={{
        userTokens,
        isLoading,
        isWhitelistedToken,
        whitelistedChainTokens,
      }}
    >
      {children}
    </UserTokensContext.Provider>
  );
};

export const useGetUserTokenContext = () => {
  const context = useContext(UserTokensContext);
  if (context === undefined) {
    throw new Error(
      "useUserTokensContextProvider must be used within a UserTokensContextProvider"
    );
  }
  return context;
};
