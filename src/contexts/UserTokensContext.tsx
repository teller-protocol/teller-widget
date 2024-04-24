import { createContext, useContext } from "react";
import { UserToken, useGetUserTokens } from "../hooks/useGetUserTokens";
import { WhitelistedTokens } from "../components/Widget/Widget";
import { useChainId } from "wagmi";

export type TokensContextType = {
  userTokens: UserToken[];
  isLoading: boolean;
  whitelistedChainTokens: string[];
  isWhitelistedToken: (token: string) => boolean;
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
  const chainId = useChainId();

  let whitelistedChainTokens = whitelistedTokens?.[chainId] ?? [];
  whitelistedChainTokens = whitelistedChainTokens.map((token) =>
    token.toLowerCase()
  );

  const { userTokens, isLoading } = useGetUserTokens(
    whitelistedChainTokens,
    showOnlyWhiteListedTokens
  );

  const isWhitelistedToken = (token: string) =>
    whitelistedChainTokens.includes(token);

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
