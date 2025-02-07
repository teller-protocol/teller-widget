import { createContext } from "react";
import { UserToken } from "../../hooks/useGetUserTokens";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";

export type PoolSectionContextType = {
  tokensWithCommitments: UserToken[];
  tokensWithCommitmentsLoading: boolean;
};

interface PoolSectionContextProps {
  children: React.ReactNode;
}

const PoolSectionContext = createContext<PoolSectionContextType>(
  {} as PoolSectionContextType
);

export const PoolSectionContextProvider: React.FC<
  PoolSectionContextProps
> = ({ children }) => {

  const { tokensWithCommitments, loading: tokensWithCommitmentsLoading } =
    useGetCommitmentsForUserTokens();

  console.log("tokensWithCommitments", tokensWithCommitments)
  console.log("tokensWithCommitmentsLoading", tokensWithCommitmentsLoading)

  return (
    <PoolSectionContext.Provider
      value={{
        tokensWithCommitments,
        tokensWithCommitmentsLoading,
      }}
    >
      {children}
    </PoolSectionContext.Provider>
  );
};
