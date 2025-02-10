// BorrowSectionContext.tsx

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

// Import your existing Uniswap hooks
import { useGetUniswapV3LiquidityPools } from "../../hooks/queries/useGetUniswapV3Pools";
import { useUniswapV3PoolUSDValue } from "../../hooks/useUniswapV3PoolUSDValue";

// -------------------------------------------------------------------
// Define the type for Uniswap data we want to store for each token,
// now including the computed APY.
export type UniswapData = {
  bestPool: any; // Replace 'any' with your actual pool type if available.
  aggregatedFeesUSD: string;
  totalUSDValue: number;
  apy: string;
};

// -------------------------------------------------------------------
// Define an enum for the borrowing steps.
export enum BorrowSectionSteps {
  SELECT_TOKEN,
  SELECT_OPPORTUNITY,
  OPPORTUNITY_DETAILS,
  ACCEPT_TERMS,
  SUCCESS,
  ADD_TO_CALENDAR,
}

// -------------------------------------------------------------------
// Define the context type with all the state values and setters.
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

// Create the context.
const BorrowSectionContext = createContext<BorrowSectionContextType>(
  {} as BorrowSectionContextType
);

// -------------------------------------------------------------------
// The Provider component.
export const BorrowSectionContextProvider: React.FC<BorrowSectionContextProps> = ({
  children,
}) => {
  // Retrieve global properties (including chainId) and any pre-selected token.
  const { singleWhitelistedToken, chainId } = useGetGlobalPropsContext();

  // Define the step state.
  const [currentStep, setCurrentStep] = useState<BorrowSectionSteps>(
    singleWhitelistedToken
      ? BorrowSectionSteps.SELECT_OPPORTUNITY
      : BorrowSectionSteps.SELECT_TOKEN
  );

  // Selected tokens.
  const [selectedCollateralToken, setSelectedCollateralToken] =
    useState<UserToken>();
  const [selectedPrincipalErc20Token, setSelectedPrincipalErc20Token] =
    useState<UserToken>();

  // Get tokens with commitments.
  const { tokensWithCommitments, loading: tokensWithCommitmentsLoading } =
    useGetCommitmentsForUserTokens();
  const {
    erc20sWithCommitments,
    isLoading: erc20sWithCommitmentsLoading,
  } = useGetCommitmentsForErc20Tokens();

  // State for principal ERC‑20 tokens.
  const [principalErc20Tokens, setPrincipalErc20Tokens] = useState<UserToken[]>([]);
  const alchemy = useAlchemy();

  // Fetch token metadata based on ERC‑20 commitments.
  useEffect(() => {
    async function fetchTokenMetadata() {
      if (!erc20sWithCommitments?.length || !alchemy) return;

      // Aggregate committed amounts by token address.
      const tokenCommitmentMap = erc20sWithCommitments
        .filter((commitment) => commitment?.principalToken?.address)
        .reduce((acc, commitment) => {
          const address = commitment?.principalToken.address.toLowerCase();
          const currentAmount = acc.get(address) || BigInt(0);
          const committedAmount = commitment?.committedAmount
            ? BigInt(commitment.committedAmount.toString())
            : BigInt(0);
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
      setPrincipalErc20Tokens(
        tokensWithMetadata.filter((token): token is UserToken => token !== null)
      );
    }

    void fetchTokenMetadata();
  }, [erc20sWithCommitments, alchemy]);

  // -------------------------------------------------------------------
  // State to hold Uniswap data for each principal token.
  const [uniswapDataMap, setUniswapDataMap] = useState<Record<string, UniswapData>>({});

  // Clear stored Uniswap data when the chain or principal tokens change.
  useEffect(() => {
    setUniswapDataMap({});
  }, [chainId, principalErc20Tokens]);

  // Other state values.
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<CommitmentType>({} as CommitmentType);
  const [successLoanHash, setSuccessLoanHash] = useState<string>("");
  const [successfulLoanParams, setSuccessfulLoanParams] = useState<any>({});
  const [bidId, setBidId] = useState<string>("");
  const [maxCollateral, setMaxCollateral] = useState<bigint>(0n);
  const [tokenTypeListView, setTokenTypeListView] = useState<BORROW_TOKEN_TYPE_ENUM>(
    BORROW_TOKEN_TYPE_ENUM.STABLE
  );

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
      {/* For each principal token, render a helper component to fetch its Uniswap data */}
      {/* Use the custom hook instead of UniswapDataFetcher */}
      {(() => {
        const uniswapData = useUniswapDataForTokens(principalErc20Tokens);
        useEffect(() => {
          setUniswapDataMap(uniswapData);
        }, [uniswapData]);
        return null;
      })()}
    </BorrowSectionContext.Provider>
  );
};

// -------------------------------------------------------------------
// Helper component that uses the existing Uniswap hooks for a given token.
// This component does not render any UI; it calls the onData callback when
// both hooks have finished loading data, and it computes the APY.
interface UniswapDataFetcherProps {
  token: UserToken;
  onData: (data: UniswapData) => void;
}

const UniswapDataFetcher: React.FC<UniswapDataFetcherProps> = ({ token, onData }) => {
  // Get Uniswap liquidity pool data using your hook.
  const {
    bestPool,
    aggregatedFeesUSD,
    isLoading: isLiquidityLoading,
  } = useGetUniswapV3LiquidityPools({
    tokenAddress: token.address,
    days: 30,
  });

  // Get the pool's USD value using your hook.
  const { totalUSDValue, isLoading: isPoolValueLoading } =
    useUniswapV3PoolUSDValue({
      poolAddress: bestPool?.id || "",
    });

  useEffect(() => {
    if (
      !isLiquidityLoading &&
      !isPoolValueLoading &&
      bestPool &&
      aggregatedFeesUSD != null &&
      totalUSDValue != null
    ) {
      const fees = parseFloat(aggregatedFeesUSD);
      const apy =
        totalUSDValue && totalUSDValue > 0
          ? (((fees / totalUSDValue) * (365 / 30)) * 100).toFixed(0)
          : "0";
      onData({ bestPool, aggregatedFeesUSD, totalUSDValue, apy });
    }
  }, [
    bestPool,
    aggregatedFeesUSD,
    totalUSDValue,
    isLiquidityLoading,
    isPoolValueLoading,
    onData,
  ]);

  return null;
};

// -------------------------------------------------------------------
// Custom hook to access the BorrowSectionContext.
export const useGetBorrowSectionContext = () => {
  const context = useContext(BorrowSectionContext);
  if (!context) {
    throw new Error(
      "useGetBorrowSectionContext must be used within a BorrowSectionContextProvider"
    );
  }
  return context;
};
