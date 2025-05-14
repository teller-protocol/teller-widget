// BorrowSectionContext.tsx

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  useGetGlobalPropsContext,
  WIDGET_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";
import { CommitmentType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";
import { useGetCommitmentsForErc20Tokens } from "../../hooks/useGetCommitmentsForErc20Tokens";
import { UserToken } from "../../hooks/useGetUserTokens";
import { BORROW_TOKEN_TYPE_ENUM } from "./CollateralTokenList/CollateralTokenList";

// Import your existing Uniswap hooks
import { useAccount, useChainId } from "wagmi";
import { getItemFromLocalStorage } from "../../helpers/localStorageUtils";
import { useGetUniswapPools } from "../../hooks/queries/useGetUniswapPools";
import { useUniswapV3PoolUSDValue } from "../../hooks/queries/useUniswapV3PoolUSDValue";
import { Address } from "viem";
import { TokenInputType } from "../../components/TokenInput/TokenInput";
import { useGetAllWLCommitmentsAcrossNetworks } from "../../hooks/queries/useGetAllWLCommitmentsAcrossNetworks";

export type UniswapData = {
  bestPool: any; // Replace with your actual pool type if available.
  aggregatedFeesUSD: string;
  totalUSDValue: number;
  apy: string;
};

export enum BorrowSectionSteps {
  SELECT_TOKEN,
  SELECT_SWAP_TOKEN,
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
  selectedSwapToken?: UserToken;
  setSelectedSwapToken: (token: UserToken | undefined) => void;
  tokensWithCommitments: UserToken[];
  tokensWithCommitmentsLoading: boolean;
  selectedOpportunity: CommitmentType;
  setSelectedOpportunity: (commitmentType: CommitmentType) => void;
  successLoanHash?: string;
  setSuccessLoanHash: (hash: string) => void;
  successfulLoanParams: any;
  setSuccessfulLoanParams: (data: any) => void;
  bidId: string;
  setBidId: (bidId: string) => void;
  maxCollateral: bigint;
  setMaxCollateral: (maxCollateral: bigint) => void;
  principalErc20Tokens: UserToken[];
  erc20sWithCommitmentsLoading: boolean;
  uniswapDataMap: Record<string, UniswapData>;
  selectedErc20Apy: string;
  borrowSwapTokenInput?: TokenInputType;
  setBorrowSwapTokenInput?: (tokenInput: TokenInputType) => void;
};

interface BorrowSectionContextProps {
  children: ReactNode;
}

const BorrowSectionContext = createContext<BorrowSectionContextType>(
  {} as BorrowSectionContextType
);

export const BorrowSectionContextProvider: React.FC<
  BorrowSectionContextProps
> = ({ children }) => {
  const { singleWhitelistedToken, strategyToken } = useGetGlobalPropsContext();

  const { address } = useAccount();

  const { widgetAction } = useGetGlobalPropsContext();

  const [currentStep, setCurrentStep] = useState<BorrowSectionSteps>(
    singleWhitelistedToken || strategyToken
      ? BorrowSectionSteps.SELECT_OPPORTUNITY
      : BorrowSectionSteps.SELECT_TOKEN
  );

  const { getPoolUSDValue, isLoading } = useUniswapV3PoolUSDValue();
  const { fetchPoolData: fetchUniswapPoolData, isLoading: isFetchingPoolData } =
    useGetUniswapPools();

  const [selectedCollateralToken, setSelectedCollateralToken] =
    useState<UserToken>();
  const [selectedPrincipalErc20Token, setSelectedPrincipalErc20Token] =
    useState<UserToken>();
  const [selectedSwapToken, setSelectedSwapToken] = useState<
    UserToken | undefined
  >();
  const [borrowSwapTokenInput, setBorrowSwapTokenInput] =
    useState<TokenInputType>();
  useState<UserToken>();
  const [selectedErc20Apy, setSelectedErc20Apy] = useState<string>("-");

  const { tokensWithCommitments, loading: tokensWithCommitmentsLoading } =
    useGetCommitmentsForUserTokens();


  const { principalErc20Tokens, isLoading: erc20sWithCommitmentsLoading } =
    useGetCommitmentsForErc20Tokens();

  // -------------------------------------------------------------------
  // State to hold Uniswap data.
  const [uniswapDataMap, setUniswapDataMap] = useState<
    Record<string, UniswapData>
  >({});

  const { data: allWhiteListedTokens, loading: isLoadingAllWhiteListedTokens } =
    useGetAllWLCommitmentsAcrossNetworks();

  useEffect(() => {
    (async () => {
      await Promise.all(
        principalErc20Tokens.map(async (token) => {
          const data = await fetchUniswapPoolData({
            tokenAddress: token.address,
            days: 30,
          });
          const bestPool = data.bestPool;
          const poolUSDValue = await getPoolUSDValue({
            poolAddress: bestPool?.id as Address,
          });

          const totalUSDValue = poolUSDValue.totalUSDValue;

          const fees = parseFloat(data.aggregatedFeesUSD);
          const apy =
            totalUSDValue && totalUSDValue > 0
              ? ((fees / totalUSDValue) * (365 / 30) * 100).toFixed(0)
              : "0";

          setUniswapDataMap((prev) => {
            return {
              ...prev,
              [token.address]: {
                bestPool,
                aggregatedFeesUSD: data.aggregatedFeesUSD,
                totalUSDValue,
                apy,
              },
            };
          });
        })
      );
    })().catch(console.error);
  }, [fetchUniswapPoolData, getPoolUSDValue, principalErc20Tokens]);

  const [selectedOpportunity, setSelectedOpportunity] =
    useState<CommitmentType>({} as CommitmentType);
  const [successLoanHash, setSuccessLoanHash] = useState<string>("");
  const [successfulLoanParams, setSuccessfulLoanParams] = useState<any>({});
  const [bidId, setBidId] = useState<string>("");
  const [maxCollateral, setMaxCollateral] = useState<bigint>(0n);

  useEffect(() => {
    if (selectedPrincipalErc20Token) {
      const uniswapData = uniswapDataMap[selectedPrincipalErc20Token.address];
      const apy = uniswapData?.apy ?? "...";
      setSelectedErc20Apy(apy);
    }
  }, [selectedPrincipalErc20Token, uniswapDataMap]);

  const contextValue = useMemo(
    () => ({
      currentStep,
      setCurrentStep,
      selectedCollateralToken,
      setSelectedCollateralToken,
      selectedPrincipalErc20Token,
      setSelectedPrincipalErc20Token,
      selectedSwapToken,
      setSelectedSwapToken,
      tokensWithCommitments: address
        ? tokensWithCommitments
        : allWhiteListedTokens,
      tokensWithCommitmentsLoading:
        isLoadingAllWhiteListedTokens || tokensWithCommitmentsLoading,
      selectedOpportunity,
      setSelectedOpportunity,
      successfulLoanParams,
      setSuccessfulLoanParams,
      successLoanHash,
      setSuccessLoanHash,
      bidId,
      setBidId,
      maxCollateral,
      setMaxCollateral,
      principalErc20Tokens,
      erc20sWithCommitmentsLoading,
      uniswapDataMap,
      selectedErc20Apy,
      borrowSwapTokenInput,
      setBorrowSwapTokenInput,
    }),
    [
      currentStep,
      selectedCollateralToken,
      selectedPrincipalErc20Token,
      selectedSwapToken,
      address,
      tokensWithCommitments,
      allWhiteListedTokens,
      isLoadingAllWhiteListedTokens,
      tokensWithCommitmentsLoading,
      selectedOpportunity,
      successfulLoanParams,
      successLoanHash,
      bidId,
      maxCollateral,
      principalErc20Tokens,
      erc20sWithCommitmentsLoading,
      uniswapDataMap,
      selectedErc20Apy,
      borrowSwapTokenInput,
    ]
  );

  return (
    <BorrowSectionContext.Provider value={contextValue}>
      {children}
      {/* For each principal token, render a helper component to fetch its Uniswap data */}
    </BorrowSectionContext.Provider>
  );
};

export const useGetBorrowSectionContext = () => {
  const context = useContext(BorrowSectionContext);
  if (!context) {
    throw new Error(
      "useGetBorrowSectionContext must be used within a BorrowSectionContextProvider"
    );
  }
  return context;
};
