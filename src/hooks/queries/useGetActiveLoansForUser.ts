import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useAccount } from "wagmi";
import { useGraphURL } from "../useGraphURL";

type CollateralToken = {
  name: string;
  symbol: string;
  decimals: number;
};

type Collateral = {
  type: string;
  collateralAddress: string;
  token: CollateralToken;
  amount: number;
  tokenId: string;
  status: string;
};

type Marketplace = {
  paymentType: string;
};

type Loan = {
  totalRepaidPrincipal: number;
  principal: number;
  borrowerAddress: string;
  lenderAddress: string;
  apr: number;
  marketplaceId: string;
  lendingTokenAddress: string;
  loanDuration: number;
  paymentCycle: string;
  paymentCycleAmount: number;
  metadataURI: string;
  bidId: string;
  acceptedTimestamp: number;
  lastRepaidTimestamp: number;
  nextDueDate: string;
  paymentDefaultDuration: number;
  status: string;
  expiresAt: string;
  collateral: Collateral;
  marketplace: Marketplace;
};

const activeStatuses = ["defaulted", "accepted", "dueSoon", "late"];

export const useGetActiveLoansForUser = () => {
  const graphURL = useGraphURL();
  const { address } = useAccount();

  // const address = "0xa3042faf15fb80227791ab41550bb5ee68daf417";

  const activeLoanForUser = gql`
    query getLoansForUserByStatus_${address} {
      user(id: "${address?.toLowerCase()}") {
        borrowers {
          loans {
            defaulted {
              totalRepaidPrincipal
              principal
              borrowerAddress
              lenderAddress
              apr
              marketplaceId
              lendingTokenAddress
              loanDuration
              paymentCycle
              paymentCycleAmount
              metadataURI
              bidId
              acceptedTimestamp
              lastRepaidTimestamp
              nextDueDate
              paymentDefaultDuration
              status
              expiresAt
              collateral {
                type
                collateralAddress
                token {
                  name
                  symbol
                  decimals
                }
                amount
                tokenId
                status
              }
              marketplace {
                paymentType
              }
            }
            late {
              totalRepaidPrincipal
              principal
              borrowerAddress
              lenderAddress
              apr
              marketplaceId
              lendingTokenAddress
              loanDuration
              paymentCycle
              paymentCycleAmount
              metadataURI
              bidId
              acceptedTimestamp
              lastRepaidTimestamp
              nextDueDate
              paymentDefaultDuration
              status
              expiresAt
              collateral {
                type
                collateralAddress
                token {
                  name
                  symbol
                  decimals
                }
                amount
                tokenId
                status
              }
              marketplace {
                paymentType
              }
            }
            dueSoon {
              totalRepaidPrincipal
              principal
              borrowerAddress
              lenderAddress
              apr
              marketplaceId
              lendingTokenAddress
              loanDuration
              paymentCycle
              paymentCycleAmount
              metadataURI
              bidId
              acceptedTimestamp
              lastRepaidTimestamp
              nextDueDate
              paymentDefaultDuration
              status
              expiresAt
              collateral {
                type
                collateralAddress
                token {
                  name
                  symbol
                  decimals
                }
                amount
                tokenId
                status
              }
              marketplace {
                paymentType
              }
            }
            accepted {
              totalRepaidPrincipal
              principal
              borrowerAddress
              lenderAddress
              apr
              marketplaceId
              lendingTokenAddress
              loanDuration
              paymentCycle
              paymentCycleAmount
              metadataURI
              bidId
              acceptedTimestamp
              lastRepaidTimestamp
              nextDueDate
              paymentDefaultDuration
              status
              expiresAt
              collateral {
                type
                collateralAddress
                token {
                  name
                  symbol
                  decimals
                }
                amount
                tokenId
                status
              }
              marketplace {
                paymentType
              }
            }
          }
        }
      }
    }
  `;

  const { data, isLoading } = useQuery({
    queryKey: ["getActiveLoansForUser", address],
    queryFn: () => request(graphURL, activeLoanForUser),
    enabled: !!address,
  }) as {
    data: {
      user: {
        borrowers: {
          loans: {
            [accepted: string]: Loan[];
            defaulted: Loan[];
            dueSoon: Loan[];
            late: Loan[];
          };
        }[];
      };
    };
    isLoading: boolean;
  };

  console.log("borrowers", data?.user?.borrowers);

  const allActiveLoans = data?.user?.borrowers?.reduce((acc, current) => {
    const currentLoans: Loan[] = [];
    activeStatuses.map((status) => currentLoans.push(...current.loans[status]));
    return [...acc, ...currentLoans];
  }, [] as Loan[]);

  return { allActiveLoans, isLoading };
};
