import { config } from "../helpers/createWagmiConfig";
import { useCallback } from "react";
import { ChainNumbers } from "../types/chainTypes";
import { useChainId } from "wagmi";
import { getToken, readContract } from "wagmi/actions";

import { AddressStringType } from "../types/addressStringType";
import { LenderGroupsPoolMetrics } from "../types/lenderGroupsPoolMetrics";

import { useContracts } from "./useContracts";
import { SupportedContractsEnum } from "./useReadContract";

export const useConvertLenderGroupCommitmentToCommitment = () => {
  const contracts = useContracts();
  const chainId = useChainId();

  const convertCommitment = useCallback(
    async (lenderGroupCommitment: LenderGroupsPoolMetrics) => {
      const totalAvailable = (await readContract(config, {
        address: lenderGroupCommitment?.group_pool_address as AddressStringType,
        functionName: "getPrincipalAmountAvailableToBorrow",
        abi: contracts[SupportedContractsEnum.LenderGroups].abi,
        args: [],
        chainId: chainId as ChainNumbers,
      }).catch((res) => {
        console.error("Error fetching totalAvailable", res);
        return BigInt(0);
      })) as bigint;

      const marketplaceFee = await readContract(config, {
        address: contracts[SupportedContractsEnum.MarketRegistry].address,
        functionName: "getMarketplaceFee",
        abi: contracts[SupportedContractsEnum.MarketRegistry].abi,
        args: [lenderGroupCommitment?.market_id],
        chainId: chainId as ChainNumbers,
      }).catch((res) => {
        console.error("Error fetching marketplaceFee", res);
        return BigInt(0);
      });

      const principalToken = await getToken(config, {
        address:
          lenderGroupCommitment?.principal_token_address as AddressStringType,
        chainId: chainId as ChainNumbers,
      }).catch((res) => {
        console.error("Error fetching principalToken", res);
        return null;
      });

      const collateralToken = await getToken(config, {
        address:
          lenderGroupCommitment?.collateral_token_address as AddressStringType,
        chainId: chainId as ChainNumbers,
      }).catch((res) => {
        console.error("Error fetching collateralToken", res);
        return null;
      });

      if (principalToken && collateralToken && totalAvailable !== undefined) {
        return {
          committedAmount: totalAvailable,
          acceptedPrincipal:
            lenderGroupCommitment.total_principal_tokens_borrowed,
          collateralToken: {
            address: lenderGroupCommitment.collateral_token_address,
            symbol: collateralToken?.symbol ?? "",
            decimals: collateralToken?.decimals ?? 0,
          },
          principalToken: {
            address: lenderGroupCommitment.principal_token_address,
            symbol: principalToken?.symbol ?? "",
            decimals: principalToken?.decimals ?? 0,
          },
          principalTokenAddress: lenderGroupCommitment.principal_token_address,
          collateralTokenType: "ERC20",
          maxDuration: lenderGroupCommitment.max_loan_duration,
          minAPY: lenderGroupCommitment.interest_rate_upper_bound,
          lenderAddress: `0x${lenderGroupCommitment.id}`,
          collateralTokenAddress:
            lenderGroupCommitment.collateral_token_address,
          collateralType: 1,
          id: BigInt(0),
          rolloverable: true,
          marketplaceId: lenderGroupCommitment.market_id,
          marketplace: {
            marketplaceFeePercent: marketplaceFee,
          },
          isLenderGroup: true,
          forwarderAddress:
            lenderGroupCommitment.smart_commitment_forwarder_address,
          collateralRatio: Number(lenderGroupCommitment.collateral_ratio),
        };
      }
    },
    [chainId, contracts]
  );

  return { convertCommitment };
};
