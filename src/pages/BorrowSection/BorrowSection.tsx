import { useMemo, useEffect, useState, useCallback } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { parseUnits } from "viem";
import {
  findTokenWithMetadata,
  useGetTokenMetadata,
} from "../../hooks/useGetTokenMetadata";
import BorrowerTerms from "./BorrowerTerms";
import {
  BorrowSectionContextProvider,
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "./BorrowSectionContext";
import CollateralTokenList from "./CollateralTokenList";
import SwapTokenList from "./SwapTokenList";
import OpportunitiesList from "./OpportunitiesList";
import OpportunityDetails from "./OpportunityDetails";
import "./borrowSection.scss";
import BorrowConfirmation from "./BorrowConfirmation";
import AddToCalendar from "../../components/AddToCalendar";
import {
  STRATEGY_ACTION_ENUM,
  useGetGlobalPropsContext,
} from "../../contexts/GlobalPropsContext";
import { useGetTokenList } from "../../hooks/queries/useGetTokenList";
import { CommitmentType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";
import { UserToken } from "../../hooks/useGetUserTokens";

const RenderComponent: React.FC = () => {
  const {
    singleWhitelistedToken,
    userTokens,
    strategyToken,
    strategyAction,
    isTradeMode,
    isStrategiesSection,
    borrowToken,
    isLoop,
  } = useGetGlobalPropsContext();
  const {
    currentStep,
    setCurrentStep,
    bidId,
    setSelectedCollateralToken,
    setSelectedPrincipalErc20Token,
    setSelectedSwapToken,
    setSelectedOpportunity,
  } = useGetBorrowSectionContext();

  const chainId = useChainId();
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: tokenList } = useGetTokenList();

  const [isInitialTokenProcessed, setIsInitialTokenProcessed] = useState(false);

  const tokenAddress =
    singleWhitelistedToken?.toLowerCase() ||
    (isStrategiesSection
      ? strategyToken?.toLowerCase()
      : borrowToken?.toLowerCase()) ||
    "";

  const { tokenMetadata, isLoading } = useGetTokenMetadata(tokenAddress || "");

  const resetSelections = useCallback(() => {
    setSelectedSwapToken(undefined);
    setSelectedCollateralToken(undefined);
    setSelectedPrincipalErc20Token(undefined);
    setSelectedOpportunity({} as CommitmentType);
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
  }, [
    setSelectedSwapToken,
    setSelectedCollateralToken,
    setSelectedPrincipalErc20Token,
    setSelectedOpportunity,
    setCurrentStep,
  ]);

  useEffect(() => {
    setIsInitialTokenProcessed(false);
  }, [strategyToken, borrowToken]);

  const shouldResetForChainMismatch = useCallback(
    (enrichedTokenChainId: number, enrichedTokenAddress: string) =>
      enrichedTokenChainId &&
      (enrichedTokenChainId !== chainId ||
        enrichedTokenAddress.toLowerCase() !== tokenAddress.toLowerCase()),
    [chainId, tokenAddress]
  );

  const processTokenInitialization = useCallback(
    (tokenData: UserToken, isLongStrategy: boolean = false) => {
      if (
        isStrategiesSection &&
        isLoop &&
        strategyToken &&
        tokenData.address.toLowerCase() === strategyToken.toLowerCase()
      ) {
        setSelectedSwapToken(tokenData);
        setSelectedCollateralToken(tokenData);
        setSelectedPrincipalErc20Token(tokenData);
        setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
        return;
      }

      if (isLongStrategy) {
        setSelectedSwapToken(tokenData);
        return;
      }

      setSelectedCollateralToken(tokenData);
      setSelectedPrincipalErc20Token(tokenData);
      setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    },
    [
      setSelectedSwapToken,
      setSelectedCollateralToken,
      setSelectedPrincipalErc20Token,
      setCurrentStep,
      isLoop,
      isStrategiesSection,
      strategyToken,
    ]
  );

  useEffect(() => {
    if (!tokenAddress || !tokenMetadata || isLoading) return;

    const tokenBalance =
      userTokens.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )?.balance || "0";
    const balanceUnits = parseUnits(tokenBalance, tokenMetadata.decimals || 18);
    const balanceBigInt = BigInt(balanceUnits.toString());

    const enrichedToken = findTokenWithMetadata(
      tokenAddress.toLowerCase(),
      tokenMetadata,
      tokenList || {},
      chainId
    );

    const tokenData: UserToken = {
      address: enrichedToken.address as `0x${string}`,
      name: enrichedToken.name || "",
      symbol: enrichedToken.symbol || "",
      logo: enrichedToken.logo || "",
      balance: tokenBalance,
      balanceBigInt: balanceBigInt.toString(),
      decimals: enrichedToken.decimals || 18,
      chainId: !address ? enrichedToken.chainId || chainId : undefined,
    };

    setIsInitialTokenProcessed(true);
    if (isInitialTokenProcessed) {
      return;
    }

    if (
      shouldResetForChainMismatch(enrichedToken.chainId, enrichedToken.address)
    ) {
      resetSelections();
      return;
    }

    if ((borrowToken || singleWhitelistedToken) && !isStrategiesSection) {
      processTokenInitialization(tokenData);
      return;
    }

    if (strategyToken && isStrategiesSection) {
      const isLongStrategy =
        !!strategyToken && strategyAction === STRATEGY_ACTION_ENUM.LONG;
      processTokenInitialization(tokenData, isLongStrategy);
    }
  }, [
    tokenAddress,
    tokenMetadata,
    isLoading,
    userTokens,
    tokenList,
    strategyToken,
    borrowToken,
    strategyAction,
    chainId,
    isTradeMode,
    isStrategiesSection,
    switchChain,
    isInitialTokenProcessed,
    setIsInitialTokenProcessed,
    address,
    resetSelections,
    shouldResetForChainMismatch,
    processTokenInitialization,
    singleWhitelistedToken,
  ]);

  const mapStepToComponent = useMemo(
    () => ({
      [BorrowSectionSteps.SELECT_TOKEN]: <CollateralTokenList />,
      [BorrowSectionSteps.SELECT_SWAP_TOKEN]: <SwapTokenList />,
      [BorrowSectionSteps.SELECT_OPPORTUNITY]: <OpportunitiesList />,
      [BorrowSectionSteps.OPPORTUNITY_DETAILS]: <OpportunityDetails />,
      [BorrowSectionSteps.ACCEPT_TERMS]: <BorrowerTerms />,
      [BorrowSectionSteps.SUCCESS]: <BorrowConfirmation />,
      [BorrowSectionSteps.ADD_TO_CALENDAR]: (
        <AddToCalendar
          bidId={bidId}
          onBack={() => setCurrentStep(BorrowSectionSteps.SUCCESS)}
        />
      ),
    }),
    [bidId, setCurrentStep]
  );

  useEffect(() => {
    if (!address) {
      setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    }
  }, [address, setCurrentStep]);

  return (
    <div className="borrow-section">{mapStepToComponent[currentStep]}</div>
  );
};

const BorrowSection: React.FC<Props> = () => {
  return (
    <BorrowSectionContextProvider>
      <RenderComponent />
    </BorrowSectionContextProvider>
  );
};

export default BorrowSection;
