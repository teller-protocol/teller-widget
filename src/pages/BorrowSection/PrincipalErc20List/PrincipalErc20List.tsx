import React from "react";
import { useGetBorrowSectionContext } from "../BorrowSectionContext";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import "./principalErc20List.scss";

const PrincipalErc20List: React.FC = () => {
  const { principalErc20Tokens } = useGetBorrowSectionContext();

  return (
    <div className="principal-erc20-list">
      {principalErc20Tokens.map((token) => (
        <CollateralTokenRow
          key={token.address}
          token={token}
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default PrincipalErc20List;
