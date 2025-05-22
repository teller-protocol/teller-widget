import { useMemo, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { parseUnits } from "viem";
import { useGetTokenMetadata } from "../../hooks/useGetTokenMetadata";
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

  useEffect(() => {
    if (tokenAddress && tokenMetadata && !isLoading) {
      const tokenBalance =
        userTokens.find(
          (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
        )?.balance || "0";

      const balanceUnits = parseUnits(
        tokenBalance,
        tokenMetadata.decimals || 18
      );
      const balanceBigInt = BigInt(balanceUnits.toString());

      if (strategyToken && strategyAction === STRATEGY_ACTION_ENUM.LONG) {
        setSelectedSwapToken({
          address: tokenAddress as `0x${string}`,
          name: tokenMetadata.name || "",
          symbol: tokenMetadata.symbol || "",
          logo: tokenMetadata.logo || "",
          balance: tokenBalance,
          balanceBigInt: balanceBigInt,
          decimals: tokenMetadata.decimals || 18,
          chainId,
        });
        return;
      }

      if (!isTradeMode && !isStrategiesSection) {
        setSelectedCollateralToken({
          address: tokenAddress as `0x${string}`,
          name: tokenMetadata.name || "",
          symbol: tokenMetadata.symbol || "",
          logo: tokenMetadata.logo || "",
          balance: tokenBalance,
          balanceBigInt: balanceBigInt,
          decimals: tokenMetadata.decimals || 18,
          chainId,
        });
      }

      setSelectedPrincipalErc20Token({
        address: tokenAddress as `0x${string}`,
        name: tokenMetadata.name || "",
        symbol: tokenMetadata.symbol || "",
        logo: tokenMetadata.logo || "",
        balance: tokenBalance,
        balanceBigInt: balanceBigInt,
        decimals: tokenMetadata.decimals || 18,
        chainId,
      });

      setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    }
  }, [
    tokenAddress,
    tokenMetadata,
    isLoading,
    setSelectedCollateralToken,
    setSelectedPrincipalErc20Token,
    setCurrentStep,
    userTokens,
    strategyToken,
    strategyAction,
    setSelectedSwapToken,
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
