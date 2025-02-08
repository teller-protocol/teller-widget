import React from "react";
import { useGetBorrowSectionContext } from "../BorrowSectionContext";
import PrincipalErc20TokenRow from "../../../components/PrincipalErc20Row";
import "./principalErc20List.scss";

const PrincipalErc20List: React.FC = () => {
  const { principalErc20Tokens, searchQuery } = useGetBorrowSectionContext();

  const filteredTokens = principalErc20Tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

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
