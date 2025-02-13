// PrincipalErc20TokenRow.tsx
import React from "react";
import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import DataPill from "../../components/DataPill";
import "./principalErc20Row.scss";

interface PrincipalErc20TokenSelectProps {
  token: UserToken;
  apy: string; // Accept APY as a prop
  onClick?: (token: UserToken) => void;
}

const PrincipalErc20TokenRow: React.FC<PrincipalErc20TokenSelectProps> = ({
  token,
  apy,
  onClick,
}) => {
  const logoUrl = token.logo || defaultTokenImage;

  return (
    <div className="principal-erc20-token-row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-balance-info">
        <div className="symbol-data-row">
          <span className="paragraph">{token.symbol}</span>
          <span style={{ fontSize: "11px", padding: "2px 5px" }}>
            <DataPill
              label={`${apy}% APY`}
              logo="https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"
            />
          </span>
        </div>
        <span className="section-sub-title">
          Available: {numberWithCommasAndDecimals(token.balance)}{" "}
          {token.symbol}
        </span>
      </div>
    </div>
  );
};

export default PrincipalErc20TokenRow;
