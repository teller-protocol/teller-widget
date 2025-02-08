
import React from "react";
import { useGetBorrowSectionContext } from "../BorrowSectionContext";
import PrincipalErc20TokenRow from "../../../components/PrincipalErc20Row";
import "./principalErc20List.scss";

const PrincipalErc20List: React.FC<{ searchQuery?: string }> = ({ searchQuery = "" }) => {
  const { principalErc20Tokens } = useGetBorrowSectionContext();

  const filteredTokens = principalErc20Tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // somehow use setSelectedCollateralToken but change to setSelectedPrincipalErc20Token
  // starts at BorrowSection, then here, then opportunities list needs new function

  return (
    <div className="principal-erc20-list">
      {filteredTokens.map((token) => (
        <PrincipalErc20TokenRow
          key={token.address}
          token={token}
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default PrincipalErc20List;
