import { useMemo, useEffect } from "react";
import { useChainId } from "wagmi";
import { useGetTokenMetadata } from "../../hooks/useGetTokenMetadata";
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

const formatAddressForAlchemy = (address: string): string | undefined => {
  if (!address) return undefined;

  // Remove accidental spaces, quotes, or invalid characters
  let formattedAddress = address.trim().toLowerCase();

  // Ensure it starts with "0x"
  if (!formattedAddress.startsWith("0x")) {
    formattedAddress = `0x${formattedAddress}`;
  }

  // Validate that it's exactly 42 characters long
  if (/^0x[a-fA-F0-9]{40}$/.test(formattedAddress)) {
    return formattedAddress;
  }

  console.error("Invalid Ethereum address:", address);
  return undefined;
};

const RenderComponent: React.FC = () => {
  const { whitelistedChainTokens, singleWhitelistedToken } = useGetGlobalPropsContext();
  const { currentStep, setCurrentStep, bidId, setSelectedCollateralToken } = useGetBorrowSectionContext();
  const chainId = useChainId();

  const tokenAddress = formatAddressForAlchemy(singleWhitelistedToken || "");
  const { tokenMetadata, isLoading } = useGetTokenMetadata(tokenAddress || '');

  useEffect(() => {
    if (tokenAddress && tokenMetadata && !isLoading) {
      setSelectedCollateralToken({
        address: tokenAddress as `0x${string}`,
        name: tokenMetadata.name || '',
        symbol: tokenMetadata.symbol || '',
        logo: tokenMetadata.logo || '',
        balance: '0',
        decimals: tokenMetadata.decimals || 18,
        chainId
      });
      setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    }
  }, [tokenAddress, tokenMetadata, isLoading, chainId, setSelectedCollateralToken, setCurrentStep]);
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