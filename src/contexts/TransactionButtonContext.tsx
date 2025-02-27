import React, { createContext, useContext, useState, ReactNode } from "react";

interface TransactionButtonContextType {
  isTransactionButtonPresent: boolean;
  setTransactionButtonPresent: (value: boolean) => void;
}

const TransactionButtonContext = createContext<
  TransactionButtonContextType | undefined
>(undefined);

export const TransactionButtonProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isTransactionButtonPresent, setTransactionButtonPresent] =
    useState(false);

  return (
    <TransactionButtonContext.Provider
      value={{
        isTransactionButtonPresent,
        setTransactionButtonPresent,
      }}
    >
      {children}
    </TransactionButtonContext.Provider>
  );
};

export const useTransactionButton = () => {
  const context = useContext(TransactionButtonContext);
  if (context === undefined) {
    throw new Error(
      "useTransactionButton must be used within a TransactionButtonProvider"
    );
  }
  return context;
};
