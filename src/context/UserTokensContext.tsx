import { createContext, useContext } from "react";
import { UserToken, useGetUserTokens } from "../hooks/useGetUserTokens";

export type UserTokensContextType = {
  userTokens: UserToken[];
  isLoading: boolean;
};

interface UserTokensContextProps {
  children: React.ReactNode;
}

const UserTokensContext = createContext({} as UserTokensContextType);

export const UserTokensContextProvider: React.FC<UserTokensContextProps> = ({
  children,
}) => {
  const { userTokens, isLoading } = useGetUserTokens();

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
