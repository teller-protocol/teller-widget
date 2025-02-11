import React, { useState } from "react";
import percentSignSvg from "../../../assets/percent-sharp.svg";
import dollarSignSvg from "../../../assets/dollar-sign-money.svg";
import CollateralTokenRow from "../../../components/CollateralTokenRow";
import Loader from "../../../components/Loader";
import SelectButtons from "../../../components/SelectButtons";
import { UserToken } from "../../../hooks/useGetUserTokens";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import PrincipalErc20List from "../../../pages/BorrowSection/PrincipalErc20List";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import { useGetGlobalPropsContext } from "../../../contexts/GlobalPropsContext";
import "./collateralTokenList.scss";

export enum BORROW_TOKEN_TYPE_ENUM {
  STABLE = "STABLE",
  ERC20 = "ERC20",
}

const selectOptions = [
  {
    value: BORROW_TOKEN_TYPE_ENUM.STABLE,
    content: (
      <img
        src={dollarSignSvg}
        style={{ width: "12.5px", height: "12.5px", verticalAlign: "middle" }}
      />
    ),
  },
  {
    value: BORROW_TOKEN_TYPE_ENUM.ERC20,
    content: (
      <img
        src={percentSignSvg}
        style={{ width: "12.5px", height: "12.5px", verticalAlign: "middle" }}
      />
    ),
  },
];


const CollateralTokenList: React.FC = () => {
  const {
    setCurrentStep,
    setSelectedCollateralToken,
    tokensWithCommitmentsLoading: loading,
    tokensWithCommitments,
    erc20sWithCommitmentsLoading: erc20Loading,
  } = useGetBorrowSectionContext();

  const { showPrincipalTokenBorrowList } = useGetGlobalPropsContext();

  const [searchQuery, setSearchQuery] = useState("");
  const { tokenTypeListView, setTokenTypeListView } = useGetBorrowSectionContext();
  const isSupportedChain = useIsSupportedChain();

  const onCollateralTokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedCollateralToken(token);
  };

  const filteredAndSortedTokens = [
    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token.balance) > 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokensWithCommitments
      .filter(
        (token) =>
          parseFloat(token.balance) <= 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
  ];
  return (
    <div className="collateral-token-list">
      {isSupportedChain ? (
        <div>
          <div className="search-and-buttons">
          <input
            type="text"
            placeholder={
              tokenTypeListView === BORROW_TOKEN_TYPE_ENUM.ERC20 
              ? "Tokens to borrow" : "Collateral for loan"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="token-search-input"
          />
          {showPrincipalTokenBorrowList &&(
            <SelectButtons
              items={selectOptions}
              value={tokenTypeListView}
              onChange={setTokenTypeListView}
            />
          )}
          </div>
          {tokenTypeListView === BORROW_TOKEN_TYPE_ENUM.ERC20 && showPrincipalTokenBorrowList ? (
              erc20Loading ? (
                <Loader />
              ) : (
                <PrincipalErc20List searchQuery={searchQuery} />
              )
            ) : (
            loading ? (
              <Loader />
            ) : filteredAndSortedTokens.length > 0 ? (
              filteredAndSortedTokens.map((token) => (
                <CollateralTokenRow
                  token={token}
                  onClick={() => onCollateralTokenSelected(token)}
                  key={token.address.toString()}
                />
              ))
            ) : (
              <div className="section-title">No tokens available</div>
            )
          )}
        </div>
      ) : (
        <div className="unsupported-chain">This chain is not supported</div>
      )}
    </div>
  );
};

export default CollateralTokenList;
