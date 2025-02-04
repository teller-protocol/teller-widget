import { useMemo, useEffect } from "react";
import { useChainId } from "wagmi";
import BorrowerTerms from "./BorrowerTerms";
import {
  BorrowSectionContextProvider,
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "./BorrowSectionContext";
import CollateralTokenList from "./CollateralTokenList";
import OpportunitiesList from "./OpportunitiesList";
import OpportunityDetails from "./OpportunityDetails";
import "./borrowSection.scss";
import BorrowConfirmation from "./BorrowConfirmation";
import AddToCalendar from "../../components/AddToCalendar";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

const RenderComponent: React.FC = () => {
  const { whitelistedChainTokens, showOnlySingleTokenAddress } = useGetGlobalPropsContext();
  const { currentStep, setCurrentStep, bidId, setSelectedCollateralToken } = useGetBorrowSectionContext();
  const chainId = useChainId();

  useEffect(() => {
    console.log("showOnlySingleTokenAddress", showOnlySingleTokenAddress)
    if (showOnlySingleTokenAddress?.startsWith('0x')) {
      const tokenAddress = `0x${showOnlySingleTokenAddress}`;
      const { tokenMetadata, isLoading } = useGetTokenMetadata(tokenAddress);
      
      if (tokenMetadata && !isLoading) {
        setSelectedCollateralToken({
          address: tokenAddress,
          name: tokenMetadata.name || '',
          symbol: tokenMetadata.symbol || '',
          logo: tokenMetadata.logo || '',
          balance: '0',
          decimals: tokenMetadata.decimals || 18,
          chainId
        });
        setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
      }
    }
  }, [showOnlySingleTokenAddress, whitelistedChainTokens, setSelectedCollateralToken, setCurrentStep]);
  const mapStepToComponent = useMemo(
    () => ({
      [BorrowSectionSteps.SELECT_TOKEN]: <CollateralTokenList />,
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
    setCurrentStep(BorrowSectionSteps.SELECT_TOKEN);
  }, [chainId, setCurrentStep, whitelistedChainTokens]);

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