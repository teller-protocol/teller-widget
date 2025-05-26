import { useMemo, useEffect } from "react";
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
  } = useGetBorrowSectionContext();

  const tokenAddress =
    singleWhitelistedToken?.toLowerCase() || strategyToken?.toLowerCase() || "";
  const { tokenMetadata, isLoading } = useGetTokenMetadata(tokenAddress || "");
  const chainId = useChainId();
  const { data: tokenList } = useGetTokenList();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!tokenAddress || !tokenMetadata || isLoading) return;

    const tokenBalance =
      userTokens.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )?.balance || "0";
    const balanceUnits = parseUnits(tokenBalance, tokenMetadata.decimals || 18);
    const balanceBigInt = BigInt(balanceUnits.toString());

    const normalizedAddress = tokenAddress.toLowerCase();
    let enrichedToken = findTokenWithMetadata(
      normalizedAddress,
      tokenMetadata,
      tokenList || {},
      chainId
    );

    if (enrichedToken.chainId && enrichedToken.chainId !== chainId) {
      switchChain({ chainId: enrichedToken.chainId });
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
      chainId: enrichedToken.chainId || chainId,
    };

    if (strategyToken && strategyAction === STRATEGY_ACTION_ENUM.LONG) {
      setSelectedSwapToken(tokenData);
      return;
    }
    
    setSelectedCollateralToken(tokenData);
    setSelectedPrincipalErc20Token(tokenData);
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
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

  const { address } = useAccount();

  useEffect(() => {
    if (!address) {
      setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
    }
  }, [address, setCurrentStep]);

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
