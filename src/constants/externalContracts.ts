import { SupportedChainId } from "./chains";
import {
  WMATIC_POLYGON_ADDRESS,
  STMATIC_POLYGON_ADDRESS,
  TOKEN_ADDRESSES,
} from "./tokens";

import { mainnet, arbitrum, polygon, goerli, sepolia, base } from "viem/chains";
import WETH_ABI from "../contracts/WETH_ABI.json";
import WMATIC_ABI from "../contracts/WMATIC_ABI.json";
import LCF_ALPHA_ABI from "../contracts/LCF_ALPHA_ABI.json";
import LRF_ABI from "../contracts/LRF_ABI.json";
import RFW_ABI from "../contracts/RFW_ABI.json";
import { erc20Abi } from "viem";
import {
  LCF_ALPHA_ARBITRUM_ADDRESS,
  LCF_ALPHA_BASE_ADDRESS,
  LCF_ALPHA_MAINNET_ADDRESS,
  LCF_ALPHA_POLYGON_ADDRESS,
} from "./lcfAlphaAddresses";
import {
  LRF_ARBITRUM_ADDRESS,
  LRF_BASE_ADDRESS,
  LRF_MAINNET_ADDRESS,
  LRF_POLYGON_ADDRESS,
} from "./lrfAddresses";
import {
  RFW_ARBITRUM_ADDRESS,
  RFW_BASE_ADDRESS,
  RFW_MAINNET_ADDRESS,
  RFW_POLYGON_ADDRESS, 
} from "./rfwAddress";

interface NetworkContract {
  address: string;
  abi: any;
}

interface NetworkContracts {
  contracts: Record<string, NetworkContract>;
}

const externalContracts: Record<SupportedChainId, NetworkContracts> = {
  [mainnet.id]: {
    contracts: {
      LenderCommitmentForwarderAlpha: {
        address: LCF_ALPHA_MAINNET_ADDRESS,
        abi: LCF_ALPHA_ABI,
      },
      LoanReferralForwarder: {
        address: LRF_MAINNET_ADDRESS,
        abi: LRF_ABI,
      },
      RolloverForWidget: {
        address: RFW_MAINNET_ADDRESS,
        abi: RFW_ABI,
      },
    },
  },
  [arbitrum.id]: {
    contracts: {
      LenderCommitmentForwarderAlpha: {
        address: LCF_ALPHA_ARBITRUM_ADDRESS,
        abi: LCF_ALPHA_ABI,
      },
      LoanReferralForwarder: {
        address: LRF_ARBITRUM_ADDRESS,
        abi: LRF_ABI,
      },
      RolloverForWidget: {
        address: RFW_ARBITRUM_ADDRESS,
        abi: RFW_ABI,
      },
    },
  },
  [goerli.id]: {
    contracts: {},
  },
  [polygon.id]: {
    contracts: {
      WMatic: {
        address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        abi: WMATIC_ABI,
      },
      WMATIC: {
        address: WMATIC_POLYGON_ADDRESS,
        abi: erc20Abi,
      },
      STMATIC: {
        address: STMATIC_POLYGON_ADDRESS,
        abi: erc20Abi,
      },
      LenderCommitmentForwarderAlpha: {
        address: LCF_ALPHA_POLYGON_ADDRESS,
        abi: LCF_ALPHA_ABI,
      },
      LoanReferralForwarder: {
        address: LRF_POLYGON_ADDRESS,
        abi: LRF_ABI,
      },
      RolloverForWidget: {
        address: RFW_POLYGON_ADDRESS,
        abi: RFW_ABI,
      },
    },
  },

  [sepolia.id]: {
    contracts: {},
  },

  [base.id]: {
    contracts: {
      LenderCommitmentForwarderAlpha: {
        address: LCF_ALPHA_BASE_ADDRESS,
        abi: LCF_ALPHA_ABI,
      },
      LoanReferralForwarder: {
        address: LRF_BASE_ADDRESS,
        abi: LRF_ABI,
      },
      RolloverForWidget: {
        address: RFW_BASE_ADDRESS,
        abi: RFW_ABI,
      },
    },
  },
};

for (const chainId in TOKEN_ADDRESSES) {
  for (const token in TOKEN_ADDRESSES[chainId]) {
    externalContracts[chainId].contracts[token] = {
      address: TOKEN_ADDRESSES[chainId][token],
      abi:
        token === "WMATIC"
          ? WMATIC_ABI
          : token === "WETH"
            ? WETH_ABI
            : erc20Abi,
    };
  }
}

export default externalContracts;
