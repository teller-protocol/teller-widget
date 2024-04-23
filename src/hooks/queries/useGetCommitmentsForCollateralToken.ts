import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useGraphURL } from "../useGraphURL";
import { useQuery } from "@tanstack/react-query";
import { useForwarderAddresses } from "../useForwarderAddresses";

export type SubgraphTokenType = {
  imageUri?: string | undefined;
  type?: string;
  nftId?: string;
  name?: string;
  symbol?: string;
  address: string;
  decimals?: number;
};

export type CommitmentType = {
  id: string;
  commitmentId?: string;
  forwarderAddress?: string;
  rolloverable?: boolean;
  minAPY?: string;
  principalTokenAddress?: string;
  maxDuration?: string;
  marketplaceId?: string;
  maxPrincipalPerCollateralAmount?: string;
  lenderAddress?: string;
  expirationTimestamp?: string;
  createdAt?: string;
  committedAmount: string;
  commitmentBorrowers?: string[];
  collateralToken?: SubgraphTokenType;
  principalToken?: SubgraphTokenType;
  requiredCollateral?: string;
  unwrapped?: boolean;
  status?: string;
  maxPrincipal?: string;
  acceptedPrincipal?: string;
  marketplace?: {
    marketplaceFeePercent: string;
  };
};

export const useGetCommitmentsForCollateralToken = (
  collateralTokenAddress?: string
) => {
  const graphURL = useGraphURL();

  const { lcfAlphaAddress, lcfAddress } = useForwarderAddresses();

  const collateralTokenCommitments = useMemo(
    () => gql`
    query commitmentsForCollateralToken_${collateralTokenAddress} {
      commitments(
        where: {
          collateralToken_: {
            address: "${collateralTokenAddress}"
          },
          status: "Active",
          expirationTimestamp_gt: "${Math.floor(Date.now() / 1000)}",
          committedAmount_gt: "0"
          forwarderAddress_in: ["${lcfAlphaAddress}", "${lcfAddress}"]
        },
        orderBy: maxPrincipalPerCollateralAmount,
        orderDirection: desc
      ) {
        collateralTokenType
        commitmentBorrowers
        committedAmount
        collateralTokenType
        createdAt
        expirationTimestamp
        id: commitmentId
        forwarderAddress
        rolloverable
        lenderAddress
        marketplaceId
        maxDuration
        maxPrincipalPerCollateralAmount
        minAPY
        principalTokenAddress
        status
        updatedAt
        collateralToken {
          id
          address
          nftId
          type
          decimals
          symbol
          name
        }
        principalToken {
          address
          type
          nftId
          decimals
          symbol
          name
        }
        marketplace {
          marketplaceFeePercent
        }
        acceptedPrincipal
        maxPrincipal
        forwarderAddress
      }
    }
  `,
    [collateralTokenAddress]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["commitmentsForCollateralToken-", collateralTokenAddress],
    queryFn: async () => request(graphURL, collateralTokenCommitments),
    enabled: !!collateralTokenAddress,
  }) as { data: { commitments: CommitmentType[] }; isLoading: boolean };

  return { data, isLoading };
};
