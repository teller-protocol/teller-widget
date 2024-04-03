import { useMemo, useState } from "react";
import { useGetUserTokenContext } from "../../context/UserTokensContext";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";
import CollateralTokenList from "./CollateralTokenList";
import "./borrowSection.scss";
import { UserToken } from "../../hooks/useGetUserTokens";
import OpportunitiesList from "./OpportunitiesList";

export enum BorrowSectionSteps {
  SELECT_TOKEN,
  SELECT_OPPORTUNITY,
  OPPORTUNITY_DETAILS,
  SUCCESS,
}

const BorrowSection: React.FC = () => {
  const { commitmentsData, loading } = useGetCommitmentsForUserTokens();

  const [currentStep, setCurrentStep] = useState<BorrowSectionSteps>(
    BorrowSectionSteps.SELECT_TOKEN
  );

  const [selectedCollateralToken, setSelectedCollateralToken] =
    useState<UserToken>();

  const [selectedOpportunity, setSelectedOpportunity] = useState<any>();

  const onCollateralTokenSelected = (token: UserToken) => {
    setSelectedCollateralToken(token);
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
  };

  const onOpportunitySelected = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setCurrentStep(BorrowSectionSteps.OPPORTUNITY_DETAILS);
  };

  const mapStepToComponent = useMemo(
    () => ({
      [BorrowSectionSteps.SELECT_TOKEN]: (
        <CollateralTokenList
          tokens={commitmentsData}
          onCollateralTokenSelected={onCollateralTokenSelected}
        />
      ),
      [BorrowSectionSteps.SELECT_OPPORTUNITY]: (
        <OpportunitiesList
          selectedCollateral={selectedCollateralToken}
          onOpportunityClick={onOpportunitySelected}
        />
      ),
      [BorrowSectionSteps.OPPORTUNITY_DETAILS]: <div>OPPORTUNITY_DETAILS</div>,
      [BorrowSectionSteps.SUCCESS]: <div>SUCCESS</div>,
    }),
    [commitmentsData, selectedCollateralToken]
  );

  return (
    <div className="borrow-section">
      {loading ? "LOADING" : mapStepToComponent[currentStep]}
    </div>
  );
};

export default BorrowSection;
