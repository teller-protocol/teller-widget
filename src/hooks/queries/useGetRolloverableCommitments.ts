import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { useGraphURL } from "../useGraphURL";
import { useQuery } from "@tanstack/react-query";
import { useForwarderAddresses } from "../useForwarderAddresses";
import { useGetMinimumBetweenLenderAndCommitment } from "../useGetMinimumBetweenLenderAndCommitment";
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
  forwarderAddress?: Address;
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

export enum CommitmentCollateralType {
  NONE = 0,
  ERC20 = 1,
  ERC721 = 2,
  ERC1155 = 3,
  ERC721_ANY_ID = 4,
  ERC1155_ANY_ID = 5,
  ERC721_MERKLE_PROOF = "6",
  ERC1155_MERKLE_PROOF = 7,
}

export type CommitmentMap = {
  [marketId: string]: CommitmentType;
};

export const useGetRolloverableCommitments = (
  collateralTokenAddress?: string,
  principalTokenAddress?: string
) => {
  const graphURL = useGraphURL();

  const { lcfAlphaAddress } = useForwarderAddresses();

  const [filteredCommitments, setFilteredCommitments] = useState<CommitmentMap>(
    {}
  );

  const [isLoading, setIsLoading] = useState(false);

  const { getMinimumBalance } = useGetMinimumBetweenLenderAndCommitment();

  const collateralTokenCommitments = useMemo(
    () => gql`
    query rolloverableCommitmentsForCollateralToken_${collateralTokenAddress} {
      commitments(
        where: {
          collateralToken_: {
            address: "${collateralTokenAddress}"
          },
          status: "Active",
          expirationTimestamp_gt: "${Math.floor(Date.now() / 1000)}",
          committedAmount_gt: "0"
          forwarderAddress_in: ["${lcfAlphaAddress}"]
          collateralTokenType:  "${CommitmentCollateralType.ERC20.toString()}"
          principalTokenAddress: "${principalTokenAddress}"
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
    [collateralTokenAddress, lcfAlphaAddress, principalTokenAddress]
  );

  const { data, isLoading: isQueryLoading } = useQuery({
    queryKey: [
      "rolloverableCommitmentsForCollateralToken-",
      collateralTokenAddress,
    ],
    queryFn: async () => request(graphURL, collateralTokenCommitments),
    enabled: !!collateralTokenAddress,
  }) as { data: { commitments: CommitmentType[] }; isLoading: boolean };

  useEffect(() => {
    setIsLoading(true);
    let isCancelled = false;
    if (!data) {
      setIsLoading(false);
      return;
    }
    void (async () => {
      await Promise.all(
        data.commitments
          .map(async (commitment) => {
            const minBalance = await getMinimumBalance(commitment);

            if (minBalance < 0) {
              return null;
            }

            return commitment;
          })
          .filter((result) => result !== null)
      ).then((result) => {
        const filteredResult = result.reduce<CommitmentMap>(
          (acc, commitment) => {
            if (!commitment) return acc;

            const marketId = commitment.marketplaceId;
            if (marketId) {
              if (!acc?.[marketId]) {
                acc[marketId] = commitment;
              }
            }
            return acc;
          },
          {}
        );
        const marketIds = Object.keys(filteredResult);
        if (isCancelled || !marketIds.length) return;
        setFilteredCommitments((prev: CommitmentMap) => {
          if (Object.keys(prev).length === marketIds.length) return prev;
          return filteredResult;
        });
      });
    })();
    setIsLoading(false);
    return () => {
      setIsLoading(false);
      isCancelled = true;
    };
  }, [data, filteredCommitments, getMinimumBalance]);

  return {
    filteredCommitments,
    isLoading: isLoading || isQueryLoading,
    hasRolloverableCommitments: data?.commitments?.length > 0,
  };
};
