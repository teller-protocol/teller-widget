export type LenderGroupsPoolMetrics = {
  id: string;
  token_difference_from_liquidations: string;
  smart_commitment_forwarder_address: string;
  collateral_token_address: string;
  twap_interval: number;
  uniswap_pool_fee: number;
  uniswap_v3_pool_address: string;
  total_principal_tokens_withdrawn: string;
  total_principal_tokens_borrowed: string;
  total_principal_tokens_repaid: string;
  total_principal_tokens_committed: string;
  total_collateral_tokens_escrowed: string;
  total_collateral_withdrawn: string;
  total_interest_collected: string;
  teller_v2_address: string;
  principal_token_address: string;
  max_loan_duration: number;
  liquidity_threshold_percent: number;
  market_id: string;
  interest_rate_upper_bound: number;
  interest_rate_lower_bound: number;
  group_pool_address: string;
  collateral_ratio: number;
  current_min_interest_rate: number;
  totalAvailable: number; // this is calculated in the frontend
  isV2?: boolean;
};

export type GetLenderGroupsRolloverableCommitmentsResponse = {
  group_pool_metric: LenderGroupsPoolMetrics[];
};
