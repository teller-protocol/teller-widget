// src/pages/BorrowSection/BorrowSectionContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAlchemy } from "../../hooks/useAlchemy";
import { UserToken } from "../../hooks/useGetUserTokens";
import { BORROW_TOKEN_TYPE_ENUM } from "./CollateralTokenList/CollateralTokenList";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";
import { CommitmentType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useGetCommitmentsForErc20Tokens } from "../../hooks/queries/useGetCommitmentsForErc20Tokens";
import { formatUnits } from "viem";
import UniswapDataFetcher from "../../components/UniswapDataFetcher";
import { UniswapData } from "../../hooks/queries/useUniswapV3Data";

export enum BorrowSectionSteps {
  SELECT_TOKEN,
  SELECT_OPPORTUNITY,
  OPPORTUNITY_DETAILS,
  ACCEPT_TERMS,
  SUCCESS,
  ADD_TO_CALENDAR,
}

export type BorrowSectionContextType = {
  currentStep: BorrowSectionSteps;
  setCurrentStep: (step: BorrowSectionSteps) => void;
  selectedCollateralToken?: UserToken;
  setSelectedCollateralToken: (token: UserToken) => void;
  selectedPrincipalErc20Token?: UserToken;
  setSelectedPrincipalErc20Token: (token: UserToken) => void;
  tokensWithCommitments: UserToken[];
  tokensWithCommitmentsLoading: boolean;
  selectedOpportunity: CommitmentType;
  setSelectedOpportunity: (commitmentType: CommitmentType) => void;
  tokenTypeListView: BORROW_TOKEN_TYPE_ENUM;
  setTokenTypeListView: (view: BORROW_TOKEN_TYPE_ENUM) => void;
  successLoanHash?: string;
  setSuccessLoanHash: (hash: string) => void;
  successfulLoanParams: any;
  setSuccessfulLoanParams: (data: any) => void;
  bidId: string;
  setBidId: (bidId: string) => void;
  maxCollateral: bigint;
  setMaxCollateral: (maxCollateral: bigint) => void;
  principalErc20Tokens: UserToken[];
  setPrincipalErc20Tokens: (tokens: UserToken[]) => void;
  erc20sWithCommitmentsLoading: boolean;
  uniswapDataMap: Record<string, UniswapData>;
  setUniswapDataMap: (data: Record<string, UniswapData>) => void;
};

interface BorrowSectionContextProps {
  children: ReactNode;
}

const BorrowSectionContext = createContext<BorrowSectionContextType>(
  {} as BorrowSectionContextType
);

export const BorrowSectionContextProvider: React.FC<BorrowSectionContextProps> = ({ children }) => {
  const { singleWhitelistedToken, chainId } = useGetGlobalPropsContext();

  const [currentStep, setCurrentStep] = useState<BorrowSectionSteps>(
    singleWhitelistedToken ? BorrowSectionSteps.SELECT_OPPORTUNITY : BorrowSectionSteps.SELECT_TOKEN
  );

  const [selectedCollateralToken, setSelectedCollateralToken] = useState<UserToken>();
  const [selectedPrincipalErc20Token, setSelectedPrincipalErc20Token] = useState<UserToken>();

  const { tokensWithCommitments, loading: tokensWithCommitmentsLoading } = useGetCommitmentsForUserTokens();
  const { erc20sWithCommitments, isLoading: erc20sWithCommitmentsLoading } = useGetCommitmentsForErc20Tokens();

  const [principalErc20Tokens, setPrincipalErc20Tokens] = useState<UserToken[]>([]);
  const alchemy = useAlchemy();

  useEffect(() => {
    async function fetchTokenMetadata() {
      if (!erc20sWithCommitments?.length || !alchemy) return;

      const tokenCommitmentMap = erc20sWithCommitments
        .filter((commitment) => commitment?.principalToken?.address)
        .reduce((acc, commitment) => {
          const address = commitment?.principalToken.address.toLowerCase();
          const currentAmount = acc.get(address) || BigInt(0);
          const committedAmount = commitment?.committedAmount ? BigInt(commitment.committedAmount.toString()) : BigInt(0);
          acc.set(address, currentAmount + committedAmount);
          return acc;
        }, new Map<string, bigint>());

      const uniqueAddresses = [...tokenCommitmentMap.keys()];

      const tokensWithMetadata = await Promise.all(
        uniqueAddresses.map(async (address) => {
          try {
            const metadata = await alchemy.core.getTokenMetadata(address);
            const aggregatedBalance = formatUnits(
              tokenCommitmentMap.get(address) || BigInt(0),
              metadata.decimals || 18
            );
            return {
              address: address as `0x${string}`,
              name: metadata.name || "",
              symbol: metadata.symbol || "",
              logo: metadata.logo || "",
              balance: aggregatedBalance || "0",
              balanceBigInt: tokenCommitmentMap.get(address) || BigInt(0),
              decimals: metadata.decimals || 18,
            } as UserToken;
          } catch (error) {
            console.error(`Error fetching metadata for token ${address}:`, error);
            return null;
          }
        })
      );
      setPrincipalErc20Tokens(tokensWithMetadata.filter((token): token is UserToken => token !== null));
    }

    void fetchTokenMetadata();
  }, [erc20sWithCommitments, alchemy]);

  const [uniswapDataMap, setUniswapDataMap] = useState<Record<string, UniswapData>>({});

  useEffect(() => {
    setUniswapDataMap({});
  }, [chainId, principalErc20Tokens]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<CommitmentType>({} as CommitmentType);
  const [successLoanHash, setSuccessLoanHash] = useState<string>("");
  const [successfulLoanParams, setSuccessfulLoanParams] = useState<any>({});
  const [bidId, setBidId] = useState<string>("");
  const [maxCollateral, setMaxCollateral] = useState<bigint>(0n);
  const [tokenTypeListView, setTokenTypeListView] = useState<BORROW_TOKEN_TYPE_ENUM>(BORROW_TOKEN_TYPE_ENUM.STABLE);

  return (
    <BorrowSectionContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedCollateralToken,
        setSelectedCollateralToken,
        selectedPrincipalErc20Token,
        setSelectedPrincipalErc20Token,
        tokensWithCommitments,
        tokensWithCommitmentsLoading,
        selectedOpportunity,
        setSelectedOpportunity,
        tokenTypeListView,
        setTokenTypeListView,
        successfulLoanParams,
        setSuccessfulLoanParams,
        successLoanHash,
        setSuccessLoanHash,
        bidId,
        setBidId,
        maxCollateral,
        setMaxCollateral,
        principalErc20Tokens,
        setPrincipalErc20Tokens,
        erc20sWithCommitmentsLoading,
        uniswapDataMap,
        setUniswapDataMap,
      }}
    >
      {children}
      {/* Render a UniswapDataFetcher for each principal token */}
      {principalErc20Tokens.map((token) => (
        <UniswapDataFetcher
          key={token.address}
          tokenAddress={token.address}
          onData={(data) =>
            setUniswapDataMap((prev) => ({ ...prev, [token.address]: data }))
          }
        />
      ))}
    </BorrowSectionContext.Provider>
  );
};

export const useGetBorrowSectionContext = () => {
  const context = useContext(BorrowSectionContext);
  if (!context) {
    throw new Error("useGetBorrowSectionContext must be used within a BorrowSectionContextProvider");
  }
  return context;
};
