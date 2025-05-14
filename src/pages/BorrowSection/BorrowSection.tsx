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
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

const RenderComponent: React.FC = () => {
  const { whitelistedChainTokens, singleWhitelistedToken, userTokens } =
    useGetGlobalPropsContext();
  const {
    currentStep,
    setCurrentStep,
    bidId,
    setSelectedCollateralToken,
    setSelectedPrincipalErc20Token,
  } = useGetBorrowSectionContext();
  const chainId = useChainId();

  const tokenAddress = singleWhitelistedToken?.toLowerCase() || "";
  const { tokenMetadata, isLoading } = useGetTokenMetadata(tokenAddress || "");

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

      setSelectedCollateralToken({
        address: tokenAddress as `0x${string}`,
        name: tokenMetadata.name || "",
        symbol: tokenMetadata.symbol || "",
        logo: tokenMetadata.logo || "",
        balance: tokenBalance,
        balanceBigInt: balanceBigInt,
        decimals: tokenMetadata.decimals || 18,
      });

      setSelectedPrincipalErc20Token({
        address: tokenAddress as `0x${string}`,
        name: tokenMetadata.name || "",
        symbol: tokenMetadata.symbol || "",
        logo: tokenMetadata.logo || "",
        balance: tokenBalance,
        balanceBigInt: balanceBigInt,
        decimals: tokenMetadata.decimals || 18,
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
