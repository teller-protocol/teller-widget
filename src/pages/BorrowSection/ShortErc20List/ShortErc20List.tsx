import React from "react";
import { useAccount } from "wagmi";
import {
  BorrowSectionSteps,
  useGetBorrowSectionContext,
} from "../BorrowSectionContext";
import { UserToken } from "../../../hooks/useGetUserTokens";
import ShortErc20TokenRow from "../../../components/ShortErc20Row";
import "./shortErc20List.scss";

import Loader from "../../../components/Loader";
import "../../../components/ShortErc20Row/shortErc20Row.scss";

const ShortErc20List: React.FC<{ searchQuery?: string }> = ({
  searchQuery = "",
}) => {
  const {
    principalErc20Tokens,
    setCurrentStep,
    setSelectedPrincipalErc20Token,
    erc20sWithCommitmentsLoading: erc20Loading,
  } = useGetBorrowSectionContext();
  const { address } = useAccount();

  const filteredTokens = principalErc20Tokens
    .filter((token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((token) => ({
      ...token,
      chainId: address ? undefined : token.chainId,
    }));

  const onShortErc20TokenSelected = (token: UserToken) => {
    setCurrentStep(BorrowSectionSteps.SELECT_OPPORTUNITY);
    setSelectedPrincipalErc20Token(token);
    window.dispatchEvent(
      new CustomEvent("teller-widget-opportunity-selected", {
        detail: {
          token: token.address,
        },
      })
    );
  };

  return (
    <div className="short-erc20-list">
      {erc20Loading ? (
        <Loader />
      ) : (
        filteredTokens.map((token) => (
          <ShortErc20TokenRow
            key={token.address}
            token={token}
            onClick={() => onShortErc20TokenSelected(token)}
          />
        ))
      )}
    </div>
  );
};

export default ShortErc20List;
