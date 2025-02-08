
import React from "react";
import { useGetBorrowSectionContext } from "../BorrowSectionContext";
import "./principalErc20List.scss";
import CollateralTokenRow from "../../../components/CollateralTokenRow";

const PrincipalErc20List: React.FC = () => {
  const { principalErc20Tokens, erc20sWithCommitments } = useGetBorrowSectionContext();

  return (
    <div className="principal-erc20-list">
      {principalErc20Tokens?.map((token) => (
        <CollateralTokenRow
          token={token}
          key={token.address}
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default PrincipalErc20List;
