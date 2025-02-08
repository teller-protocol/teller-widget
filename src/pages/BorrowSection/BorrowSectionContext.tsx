import { createContext, useContext, useState, useEffect } from "react";
import { useAlchemy } from "../../hooks/useAlchemy";
import { UserToken } from "../../hooks/useGetUserTokens";
import { useGetCommitmentsForUserTokens } from "../../hooks/queries/useGetCommitmentsForUserTokens";
import { CommitmentType } from "../../hooks/queries/useGetCommitmentsForCollateralToken";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import { useGetCommitmentsForErc20Tokens, convertCommitmentsToUniquePrincipalTokens } from "../../hooks/queries/useGetCommitmentsForErc20Tokens";
import { useGetTokenMetadata } from "../../hooks/useGetTokenMetadata";

export enum BorrowSectionSteps {
  SELECT_TOKEN,
  SELECT_OPPORTUNITY,
  OPPORTUNITY_DETAILS,
  ACCEPT_TERMS,
  SUCCESS,
  ADD_TO_CALENDAR,
}

export type BorrowSectionContextType = {
  currentStep: BorrowSectionSteps;
  setCurrentStep: (step: BorrowSectionSteps) => void;
  selectedCollateralToken?: UserToken;
  setSelectedCollateralToken: (token: UserToken) => void;
  selectedOpportunity: CommitmentType;
  setSelectedOpportunity: (commitmentType: CommitmentType) => void;
  tokensWithCommitments: UserToken[];
  tokensWithCommitmentsLoading: boolean;
  successLoanHash?: string;
  setSuccessLoanHash: (hash: string) => void;
  successfulLoanParams: any;
  setSuccessfulLoanParams: (data: any) => void;
  bidId: string;
  setBidId: (bidId: string) => void;
  maxCollateral: bigint;
  setMaxCollateral: (maxCollateral: bigint) => void;
};

interface BorrowSectionContextProps {
  children: React.ReactNode;
}

const BorrowSectionContext = createContext<BorrowSectionContextType>(
  {} as BorrowSectionContextType
);

export const BorrowSectionContextProvider: React.FC<
  BorrowSectionContextProps
> = ({ children }) => {
  const { singleWhitelistedToken } = useGetGlobalPropsContext();
  const [currentStep, setCurrentStep] = useState<BorrowSectionSteps>(
    singleWhitelistedToken
      ? BorrowSectionSteps.SELECT_OPPORTUNITY
      : BorrowSectionSteps.SELECT_TOKEN
  );

  const [selectedCollateralToken, setSelectedCollateralToken] =
    useState<UserToken>();

  const { tokensWithCommitments, loading: tokensWithCommitmentsLoading } =
    useGetCommitmentsForUserTokens();

  // query to get all pools, non-blocked, where principalToken not in supportedPrincipalTokens
  // look at way done in pools section
  // return tokens list as 

  const { erc20sWithCommitments, isLoading: erc20sWithCommitmentsLoading } = useGetCommitmentsForErc20Tokens();

  console.log("erc20sWithCommitments", erc20sWithCommitments)

  const [principalErc20Tokens, setPrincipalErc20Tokens] = useState<UserToken[]>([]);

  useEffect(() => {
    if (!erc20sWithCommitments?.length) return;

    const uniqueAddresses = [...new Set(
      erc20sWithCommitments
        .filter(commitment => commitment?.principalToken?.address)
        .map(commitment => commitment?.principalToken.address.toLowerCase())
    )];

    const tokens = uniqueAddresses.map(address => {
      const { tokenMetadata } = useGetTokenMetadata(address as string);
      return tokenMetadata ? {
        address: address as `0x${string}`,
        name: tokenMetadata.name || '',
        symbol: tokenMetadata.symbol || '',
        logo: tokenMetadata.logo || '',
        balance: '0',
        balanceBigInt: BigInt(0),
        decimals: tokenMetadata.decimals || 18,
      } : null;
    });

    setPrincipalErc20Tokens(tokens.filter((token): token is UserToken => token !== null));
  }, [erc20sWithCommitments]); 

  console.log("principalErc20Tokens", principalErc20Tokens)

  const [selectedOpportunity, setSelectedOpportunity] =
    useState<CommitmentType>({} as CommitmentType);

  const [successLoanHash, setSuccessLoanHash] = useState<string>("");

  const [successfulLoanParams, setSuccessfulLoanParams] = useState<any>({});

  const [bidId, setBidId] = useState<string>("");

  const [maxCollateral, setMaxCollateral] = useState<bigint>(0n);

  return (
    <BorrowSectionContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedCollateralToken,
        setSelectedCollateralToken,
        tokensWithCommitments,
        tokensWithCommitmentsLoading,
        selectedOpportunity,
        setSelectedOpportunity,
        successfulLoanParams,
        setSuccessfulLoanParams,
        successLoanHash,
        setSuccessLoanHash,
        bidId,
        setBidId,
        maxCollateral,
        setMaxCollateral,
        // onCollateralTokenSelected,
        // onOpportunitySelected,
        // mapStepToComponent,
      }}
    >
      {children}
    </BorrowSectionContext.Provider>
  );
};

export const useGetBorrowSectionContext = () => {
  const context = useContext(BorrowSectionContext);
  if (context === undefined) {
    throw new Error(
      "useGetBorrowSectionContext must be used within a BorrowSectionContextProvider"
    );
  }

  return context;
};
