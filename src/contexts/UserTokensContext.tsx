import { createContext, useContext } from "react";
import { UserToken, useGetUserTokens } from "../hooks/useGetUserTokens";
import { AppTokens } from "../components/Widget/Widget";

export type TokensContextType = {
  userTokens: UserToken[];
  isLoading: boolean;
};

interface TokensContextProps {
  children: React.ReactNode;
  tokens?: AppTokens;
}

const UserTokensContext = createContext({} as TokensContextType);

export const TokensContextProvider: React.FC<TokensContextProps> = ({
  children,
  tokens,
}) => {
  const { userTokens, isLoading } = useGetUserTokens(tokens);

  return (
    <UserTokensContext.Provider value={{ userTokens, isLoading }}>
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
