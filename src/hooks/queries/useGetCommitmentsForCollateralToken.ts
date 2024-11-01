import request, { gql } from "graphql-request";
import { useMemo } from "react";
import { useGraphURL } from "../useGraphURL";
import { useQuery } from "@tanstack/react-query";
import { useForwarderAddresses } from "../useForwarderAddresses";
import { Address } from "viem";

export type SubgraphTokenType = {
  imageUri?: string | undefined;
  type?: string;
  nftId?: string;
  name?: string;
  symbol?: string;
  address: Address;
  decimals?: number;
};

export type CommitmentType = {
  id: string;
  commitmentId?: string;
  forwarderAddress?: string;
  rolloverable?: boolean;
  minAPY?: string;
  principalTokenAddress?: Address;
  maxDuration?: string;
  marketplaceId?: string;
  maxPrincipalPerCollateralAmount?: string;
  lenderAddress?: Address;
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
  collateralTokenAddress?: string,
  userAddress?: Address
) => {
  const graphURL = useGraphURL();

  const { lcfAlphaAddress, lcfAddress } = useForwarderAddresses();

  const collateralTokenCommitments = useMemo(
    () => gql`
    query commitmentsForCollateralToken_${collateralTokenAddress} {
      commitments(
        where: {
          and: [
            {
              collateralToken_: {
                address: "${collateralTokenAddress}"
              },
              status: "Active",
              expirationTimestamp_gt: "${Math.floor(Date.now() / 1000)}",
              committedAmount_gt: "0",
              forwarderAddress_in: [
                "${lcfAlphaAddress}",
                "${lcfAddress}"
              ]
            },
            ${
              userAddress
                ? `{
              or: [
                { commitmentBorrowers_contains: ["${userAddress}"] },
                { commitmentBorrowers: [] }
              ]
            }`
                : { commitmentBorrowers: [] }
            }
          ]
        },
        orderBy: maxPrincipalPerCollateralAmount,
        orderDirection: desc
      ) {
        collateralTokenType
        commitmentBorrowers
        committedAmount
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
      }
    }
  `,
    [collateralTokenAddress, lcfAddress, lcfAlphaAddress, userAddress]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["commitmentsForCollateralToken-", collateralTokenAddress],
    queryFn: async () => request(graphURL, collateralTokenCommitments),
    enabled: !!collateralTokenAddress,
  }) as {
    data: { commitments: CommitmentType[] };
    isLoading: boolean;
    error: string;
  };

  if (error) console.error("commitmentsForCollateralToken Query error", error);

  return { data, isLoading };
};
