/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useCalculateMaxCollateralFromCommitment } from "../useCalculateMaxCollateralFromCommitment";
import { useConvertLenderGroupCommitmentToCommitment } from "../useConvertLenderGroupCommitmentToCommitment";
import { useForwarderAddresses } from "../useForwarderAddresses";
import { useGetMinimumBetweenLenderAndCommitment } from "../useGetMinimumBetweenLenderAndCommitment";
import { useGraphURL } from "../useGraphURL";
import { Loan } from "./useGetActiveLoansForUser";
import { useGetRolloverableCommitmentsFromLiquidityPools } from "./useGetRolloverableCommitmentsFromLiquidityPools";

export type CommitmentMapArray = Map<string, CommitmentType[]>;

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
  isLenderGroup?: boolean; // this does NOT exist in subgraph
  collateralRatio?: number; // this does NOT exist in subgraph
};

/**
 If a LCFa commitment's maxPrincipalPerCollateral ends in 69, add it first.
 */
const combineCommitments = (
  commitments: CommitmentType[],
  lenderGroupsRolloverableCommitments?: any
) => {
  const commitmentsWithLCF69 = [];
  const modifiedCommitments = [...(commitments ?? [])];
  for (let i = 0; i < modifiedCommitments.length; i++) {
    if (
      modifiedCommitments[i]?.maxPrincipalPerCollateralAmount?.endsWith("69")
    ) {
      const foundItem = modifiedCommitments[i];
      modifiedCommitments.splice(i, 1);
      commitmentsWithLCF69.push(foundItem);
    }
  }

  return [
    ...commitmentsWithLCF69,
    ...(lenderGroupsRolloverableCommitments ?? []),
    ...modifiedCommitments,
  ] as CommitmentType[];
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

export type CommitmentMap = Map<string, CommitmentType>;

export const useGetRolloverableCommitments = (
  collateralTokenAddress?: string,
  principalTokenAddress?: string,
  loan?: Loan
) => {
  const graphURL = useGraphURL();

  const { lcfAlphaAddress } = useForwarderAddresses();

  const [filteredCommitments, setFilteredCommitments] = useState<CommitmentMap>(
    new Map()
  );

  const [rawCommitments, setRawCommitments] = useState<CommitmentType[]>([]);
  const [isRawCommitmentsLoading, setIsRawCommitmentsLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [
    convertedLenderGroupsRolloverableCommitments,
    setConvertedLenderGroupsRolloverableCommitments,
  ] = useState<CommitmentType[]>([]);

  const { convertCommitment } = useConvertLenderGroupCommitmentToCommitment();

  const { getMinimumBalance } = useGetMinimumBetweenLenderAndCommitment();

  const { calculateMaxCollateral } = useCalculateMaxCollateralFromCommitment();

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

  const {
    data: lenderGroupsRolloverableCommitments,
    isLoading: isLenderGroupsRolloverableCommitmentsLoading,
  } = useGetRolloverableCommitmentsFromLiquidityPools(
    collateralTokenAddress,
    principalTokenAddress
  );

  const commitments = data?.commitments;

  useEffect(() => {
    const controller = new AbortController();

    if (convertedLenderGroupsRolloverableCommitments.length > 0) {
      controller.abort();
      return;
    }

    if (lenderGroupsRolloverableCommitments?.groupPoolMetrics?.length) {
      setIsRawCommitmentsLoading(true);

      const fetchConvertedCommitments = async () => {
        try {
          const groupMetrics =
            lenderGroupsRolloverableCommitments?.groupPoolMetrics;
          if (!groupMetrics?.length) return;

          await Promise.all(
            groupMetrics.map(async (group) => {
              try {
                if (controller.signal.aborted) return null;
                return await convertCommitment(group);
              } catch (error) {
                console.error("Error converting commitment:", error);
                return null;
              }
            })
          ).then((poolCommitments) => {
            const validCommitments = poolCommitments.filter((item) => !!item);
            const combinedCommitments = combineCommitments(
              commitments,
              validCommitments
            );
            setRawCommitments(combinedCommitments);
            setIsRawCommitmentsLoading(false);
          });
        } catch (error) {
          console.error("Error fetching converted commitments:", error);
          setIsRawCommitmentsLoading(false);
          setRawCommitments([]);
        }
      };
      void fetchConvertedCommitments();
    } else {
      setRawCommitments(commitments);
      setIsRawCommitmentsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [
    lenderGroupsRolloverableCommitments?.groupPoolMetrics,
    convertCommitment,
    convertedLenderGroupsRolloverableCommitments.length,
    convertedLenderGroupsRolloverableCommitments,
    commitments,
  ]);

  useEffect(() => {
    let isCancelled = false;

    if (
      (!rawCommitments && !isLenderGroupsRolloverableCommitmentsLoading) ||
      !loan
    ) {
      setIsLoading(false);
      return;
    }

    if (isLenderGroupsRolloverableCommitmentsLoading) {
      setIsLoading(true);
      return;
    }

    void (async () => {
      try {
        const results = await Promise.all(
          rawCommitments
            .map(async (commitment) => {
              const minBalance = await getMinimumBalance(commitment);
              if (minBalance < 0) {
                return null;
              }
              return commitment;
            })
            .filter((result) => result !== null)
        );

        if (isCancelled) return;

        if (results.length === 0) {
          setIsLoading(false);
          return;
        }

        /*
        Show only a commitment that has sufficient principal to rollover the collateral from the current loan.
        If no commitment has sufficient principal, show the one with the highest maxPricipalPerCollateral.

        We first organize the commitments by marketId, to be able to iterate through commitments per marketId for the dropdown.
        */
        const commitmentsByMarketId = results.reduce<CommitmentMapArray>(
          (acc, commitment) => {
            if (!commitment || !commitment?.rolloverable) return acc;

            const marketId = commitment.marketplaceId;
            if (marketId) {
              if (!acc.has(marketId)) {
                acc.set(marketId, []);
              }
              acc.get(marketId)?.push(commitment);
            }
            return acc;
          },
          new Map()
        );

        await Array.from(commitmentsByMarketId.entries())
          .reduce<Promise<CommitmentMap>>(
            async (accPromise, [marketId, commitments]) => {
              const acc = await accPromise;
              const bestCommitment = await Promise.all(
                commitments.map(async (current) => {
                  if (commitments.length === 1) return current;
                  const isSameLender =
                    loan?.lenderAddress?.toLowerCase() ===
                    current?.lenderAddress?.toLowerCase();
                  const loanAmount: bigint = BigInt(loan?.principal);
                  const maxCollateral = await calculateMaxCollateral(
                    current,
                    isSameLender,
                    loanAmount
                  );
                  return BigInt(maxCollateral) >=
                    BigInt(loan?.collateral?.[0]?.amount)
                    ? current
                    : null;
                })
              )
                .then(
                  (results) =>
                    results.find((result) => result !== null) || commitments[0]
                )
                .catch((error) => {
                  console.error("Error finding best commitment:", error);
                  return commitments[0]; // Return first commitment as fallback
                });
              acc.set(
                bestCommitment?.marketplaceId as string,
                bestCommitment ?? {}
              );
              return acc;
            },
            Promise.resolve(new Map())
          )
          .then((result) => {
            const marketIds = Array.from(result.keys());
            if (isCancelled || !marketIds.length) return;
            setFilteredCommitments((prev: CommitmentMap) => {
              if (prev.size === marketIds.length) return prev;
              return result;
            });
            return result;
          });

        setIsLoading(false); // Only set loading to false after successful processing
      } catch (error) {
        console.error("Error processing commitments:", error);
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    calculateMaxCollateral,
    commitments,
    convertedLenderGroupsRolloverableCommitments,
    getMinimumBalance,
    isLenderGroupsRolloverableCommitmentsLoading,
    loan,
    rawCommitments,
  ]);

  return {
    filteredCommitments,
    isLoading: isLoading || isQueryLoading || isRawCommitmentsLoading,
    hasRolloverableCommitments: rawCommitments.length > 0,
  };
};
