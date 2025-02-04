import { useMemo, useEffect } from "react";
import { useChainId } from "wagmi";
import { useAlchemy } from '@alch/alchemy-web3'; // Added Alchemy import - ASSUMPTION
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

// Added UserToken type definition - ASSUMPTION
type UserToken = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  balanceBigInt: bigint;
  decimals: number;
};


const RenderComponent: React.FC = () => {
  const { whitelistedChainTokens, showOnlySingleTokenAddress } = useGetGlobalPropsContext();
  const { currentStep, setCurrentStep, bidId, setSelectedCollateralToken } = useGetBorrowSectionContext();
  const chainId = useChainId();
  const alchemy = useAlchemy(); // Added Alchemy hook call


  useEffect(() => {
    if (showOnlySingleTokenAddress?.startsWith('0x')) {
      const fetchTokenData = async () => {
        try {
          const metadata = await alchemy.core.getTokenMetadata(showOnlySingleTokenAddress);
          const token: UserToken = {
            address: showOnlySingleTokenAddress,
            name: metadata.name ?? '',
            symbol: metadata.symbol ?? '',
            logo: metadata.logo ?? '',
            balance: '0',
            balanceBigInt: BigInt(0),
            decimals: metadata.decimals ?? 18,
          };
          setSelectedCollateralToken(token);
          setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
        } catch (error) {
          console.error("Error fetching token metadata:", error);
          // Handle error appropriately, e.g., display an error message
        }
      };
      void fetchTokenData();
    }
  }, [showOnlySingleTokenAddress, alchemy, setSelectedCollateralToken, setCurrentStep]);
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