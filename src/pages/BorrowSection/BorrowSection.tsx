import { useMemo, useEffect, useState } from "react";
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

const RenderComponent: React.FC = () => {
  const {
    singleWhitelistedToken,
    userTokens,
    strategyToken,
    strategyAction,
    isTradeMode,
    isStrategiesSection,
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

  const [isStrategyTokenProcessed, setIsStrategyTokenProcessed] =
    useState(false);

  const tokenAddress =
    singleWhitelistedToken?.toLowerCase() || strategyToken?.toLowerCase() || "";
  const { tokenMetadata, isLoading } = useGetTokenMetadata(tokenAddress || "");

  useEffect(() => {
    if (
      !tokenAddress ||
      !tokenMetadata ||
      isLoading ||
      isStrategyTokenProcessed
    )
      return;

    const tokenBalance =
      userTokens.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )?.balance || "0";
    const balanceUnits = parseUnits(tokenBalance, tokenMetadata.decimals || 18);
    const balanceBigInt = BigInt(balanceUnits.toString());

    let enrichedToken = findTokenWithMetadata(
      tokenAddress.toLowerCase(),
      tokenMetadata,
      tokenList || {},
      chainId
    );

    if (enrichedToken.chainId && enrichedToken.chainId !== chainId) {
      setSelectedSwapToken(undefined);
      setSelectedCollateralToken(undefined);
      setSelectedPrincipalErc20Token(undefined);
      setSelectedOpportunity({} as CommitmentType);
      setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
      return;
    }

    const tokenData = {
      address: enrichedToken.address as `0x${string}`,
      name: enrichedToken.name || "",
      symbol: enrichedToken.symbol || "",
      logo: enrichedToken.logo || "",
      balance: tokenBalance,
      balanceBigInt: balanceBigInt,
      decimals: enrichedToken.decimals || 18,
      chainId: !address ? enrichedToken.chainId || chainId : undefined,
    };

    if (strategyToken && strategyAction === STRATEGY_ACTION_ENUM.LONG) {
      setSelectedSwapToken(tokenData);
      setIsStrategyTokenProcessed(true);
      return;
    }

    setSelectedCollateralToken(tokenData);
    setSelectedPrincipalErc20Token(tokenData);
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setIsStrategyTokenProcessed(false);
  }, [
    tokenAddress,
    tokenMetadata,
    isLoading,
    setSelectedCollateralToken,
    setSelectedPrincipalErc20Token,
    setCurrentStep,
    userTokens,
    tokenList,
    strategyToken,
    strategyAction,
    setSelectedSwapToken,
    chainId,
    isTradeMode,
    isStrategiesSection,
    switchChain,
    isStrategyTokenProcessed,
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

  useEffect(() => {
    if (chainId) setIsStrategyTokenProcessed(false);
  }, [chainId]);

  return (
    <div className="borrow-section">{mapStepToComponent[currentStep]}</div>
  );
};

const BorrowSection: React.FC = () => {
  return (
    <BorrowSectionContextProvider>
      <RenderComponent />
    </BorrowSectionContextProvider>
  );
};

export default BorrowSection;
