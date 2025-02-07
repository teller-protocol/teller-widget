import React from "react";
import { formatUnits } from "viem";
import { LenderGroupsPoolMetrics } from "../../types/lenderGroupsPoolMetrics";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { useGetTokenMetadata } from "../../hooks/useGetTokenMetadata";
import { SUPPORTED_TOKEN_LOGOS } from "../../constants/tokens";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";

import "./poolRow.scss";

interface PoolSelectProps {
  pool: LenderGroupsPoolMetrics;
}

const PoolRow: React.FC<PoolSelectProps> = ({ pool }) => {
  // Retrieve metadata for both principal and collateral tokens
  const { tokenMetadata: principalTokenMetadata } = useGetTokenMetadata(pool?.principal_token_address);
  const { tokenMetadata: collateralTokenMetadata } = useGetTokenMetadata(pool?.collateral_token_address);

  const principalTokenSymbol = principalTokenMetadata?.symbol || '';
  const collateralTokenSymbol = collateralTokenMetadata?.symbol || '';

  // Get logo URLs (fallback to defaults if needed)
  const principalLogo = principalTokenMetadata?.logo ?? SUPPORTED_TOKEN_LOGOS[principalTokenSymbol];
  const principalLogoUrl = principalLogo ? principalLogo : defaultTokenImage;

  const collateralLogo = collateralTokenMetadata?.logo ?? SUPPORTED_TOKEN_LOGOS[collateralTokenSymbol];
  const collateralLogoUrl = collateralLogo ? collateralLogo : defaultTokenImage;

  const committed = BigInt(pool.total_principal_tokens_committed);
  const withdrawn = BigInt(pool.total_principal_tokens_withdrawn);
  const interest = BigInt(pool.total_interest_collected);
  const trueLiquidity = committed - withdrawn + interest;

  const principalTokenDecimals = principalTokenMetadata?.decimals || 18;
  const trueLiquidityFormatted = formatUnits(trueLiquidity, principalTokenDecimals);

  return (
    <div className="pool-row">
      <div className="token-logos">
        <TokenLogo logoUrl={principalLogoUrl} size={32} />
        <TokenLogo logoUrl={collateralLogoUrl} size={32} />
      </div>
      <div className="token-balance-info">
        <span className="paragraph">
          {principalTokenSymbol} / {collateralTokenSymbol}
        </span>
        <span className="section-sub-title">
          APR: {(pool?.current_min_interest_rate / 100).toFixed(0)}% ∙ {numberWithCommasAndDecimals(trueLiquidityFormatted)} {principalTokenSymbol}
        </span>
      </div>
    </div>
  );
};

export default PoolRow;
