import { createContext, useContext } from "react";
import { CommitmentType } from "../../hooks/queries/useGetRolloverableCommitments";
import { useGetLiquidityPools } from "../../hooks/queries/useGetLiquidityPools";

// then in PoolList.tsx, use data and fill in cards

export type PoolSectionContextType = {
  liquidityPools: CommitmentType[];
  liquidityPoolsLoading: boolean;
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

  const { data: liquidityPools, isLoading: liquidityPoolsLoading, } = useGetLiquidityPools();

  return (
    <PoolSectionContext.Provider
      value={{
        liquidityPools,
        liquidityPoolsLoading,
      }}
    >
      {children}
    </PoolSectionContext.Provider>
  );
};

export const useGetPoolSectionContext = () => {
  const context = useContext(PoolSectionContext);
  if (context === undefined) {
    throw new Error(
      "useGetBorrowSectionContext must be used within a BorrowSectionContextProvider"
    );
  }

  return context;
};
