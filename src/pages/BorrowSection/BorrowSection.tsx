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

      let address = tokenAddress.toLowerCase();
      let chainIdToUse = chainId;

      let currentToken = tokenList?.[chainId]?.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      if (!currentToken) {
        currentToken = tokenList?.[chainId]?.find(
          (token) =>
            token.symbol.toLowerCase() === tokenMetadata.symbol?.toLowerCase()
        );
        if (!currentToken) {
          const chains = Object.keys(tokenList || {});
          for (const chain of chains) {
            currentToken = tokenList?.[parseInt(chain)]?.find(
              (token) =>
                token.address.toLowerCase() === tokenAddress.toLowerCase()
            );
            if (currentToken) break;
          }
        }
        if (currentToken) {
          tokenMetadata.name = currentToken.name || "";
          tokenMetadata.symbol = currentToken.symbol || "";
          tokenMetadata.logo = currentToken.logoURI || "";
          tokenMetadata.decimals = currentToken.decimals || 18;
          address = currentToken.address;
          chainIdToUse = currentToken.chainId;
        }
      }

      if (strategyToken && strategyAction === STRATEGY_ACTION_ENUM.LONG) {
        setSelectedSwapToken({
          address: address as `0x${string}`,
          name: tokenMetadata.name || "",
          symbol: tokenMetadata.symbol || "",
          logo: tokenMetadata.logo || "",
          balance: tokenBalance,
          balanceBigInt: balanceBigInt,
          decimals: tokenMetadata.decimals || 18,
          chainId: chainIdToUse,
        });
        return;
      }

      if (!isTradeMode && !isStrategiesSection) {
        setSelectedCollateralToken({
          address: address as `0x${string}`,
          name: tokenMetadata.name || "",
          symbol: tokenMetadata.symbol || "",
          logo: tokenMetadata.logo || "",
          balance: tokenBalance,
          balanceBigInt: balanceBigInt,
          decimals: tokenMetadata.decimals || 18,
          chainId: chainIdToUse,
        });
      }

      setSelectedPrincipalErc20Token({
        address: address as `0x${string}`,
        name: tokenMetadata.name || "",
        symbol: tokenMetadata.symbol || "",
        logo: tokenMetadata.logo || "",
        balance: tokenBalance,
        balanceBigInt: balanceBigInt,
        decimals: tokenMetadata.decimals || 18,
        chainId: chainIdToUse,
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
    tokenList,
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
