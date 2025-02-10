import React from "react";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import { UserToken } from "../../../hooks/useGetUserTokens";
import PrincipalErc20TokenRow from "../../../components/PrincipalErc20Row";
import "./principalErc20List.scss";

import TokenLogo from "../../../components/TokenLogo";
import Loader from "../../../components/Loader";
import "../../../components/PrincipalErc20Row/principalErc20Row.scss";

const PrincipalErc20List: React.FC<{ searchQuery?: string }> = ({ searchQuery = "" }) => {
  const {
    principalErc20Tokens,
    uniswapDataMap, // Get uniswapDataMap here
    setCurrentStep,
    setSelectedPrincipalErc20Token,
    setSelectedErc20Apy,
    erc20sWithCommitmentsLoading: erc20Loading,
  } = useGetBorrowSectionContext();

  const filteredTokens = principalErc20Tokens.filter((token) =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onPrincipalErc20TokenSelected = (token: UserToken, apy: string) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedPrincipalErc20Token(token);
    setSelectedErc20Apy(apy);
  };

  return (
    <div className="principal-erc20-list">
      <div
        className="principal-erc20-token-row"
        style={{
          border: "none",
          backgroundColor: "rgba(190, 190, 190, 0.1)",
          pointerEvents: "none",
        }}
      >
        <TokenLogo
          logoUrl={
            "https://seeklogo.com/images/U/uniswap-logo-E8E2787349-seeklogo.com.png"
          }
          size={32}
        />
        <div className="token-balance-info">
          <span className="paragraph">Borrow {'>'} Earn APY</span>
          <span className="section-sub-title" style={{ fontSize: "9px" }}>
            Source liquidity to pool on Uniswap
          </span>
        </div>
      </div>
      {erc20Loading ? (
        <Loader />
      ) : (
        filteredTokens.map((token) => {
          // Retrieve APY from the uniswapDataMap based on token address
          const uniswapData = uniswapDataMap[token.address];
          const apy = uniswapData?.apy ?? "...";

          return (
            <PrincipalErc20TokenRow
              key={token.address}
              token={token}
              apy={apy} // Pass APY as a prop
              onClick={() => onPrincipalErc20TokenSelected(token, apy)}
            />
          );
        })
      )}
    </div>
  );
};

export default PrincipalErc20List;
