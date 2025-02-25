import { useState } from "react";
import cx from "classnames";
import { UserToken } from "../../hooks/useGetUserTokens";
import { BORROW_TOKEN_TYPE_ENUM } from "../../pages/BorrowSection/CollateralTokenList/CollateralTokenList";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";
import "./tokenDropdown.scss";
import { useGetBorrowSectionContext } from "../../pages/BorrowSection/BorrowSectionContext";
import {
  useGetGlobalPropsContext,
  WIDGET_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import { Icon } from "@iconify/react";

interface TokenDropdownProps {
  tokens: UserToken[];
  selectedToken: UserToken;
}

interface TokenDropdownButtonProps {
  token: UserToken;
  onClick?: (token: UserToken) => void;
}

const TokenDropdownRow: React.FC<TokenDropdownButtonProps> = ({
  token,
  onClick,
}) => {
  const logoUrl = token?.logo ? token.logo : defaultTokenImage;

  const { isStrategiesSection } = useGetGlobalPropsContext();

  const subtitleData = !isStrategiesSection
    ? {
        title: "Balance",
        value: Number(token?.balance).toFixed(3),
      }
    : {
        title: "Available",
        value: numberWithCommasAndDecimals(token?.balance),
      };

  return (
    <div className="token-dropdown--row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-info">
        <div className="paragraph">{token?.symbol}</div>
        <div className="section-sub-title">
          {subtitleData.title}: {subtitleData.value} {token?.symbol}
        </div>
      </div>
    </div>
  );
};

const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  selectedToken: token,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { setSelectedCollateralToken, setSelectedPrincipalErc20Token } =
    useGetBorrowSectionContext();
  const { singleWhitelistedToken } = useGetGlobalPropsContext();

  const { isStrategiesSection } = useGetGlobalPropsContext();

  const onTokenDropdownRowClick = (token: UserToken) => {
    if (!isStrategiesSection) {
      setSelectedCollateralToken(token);
    } else {
      setSelectedPrincipalErc20Token(token);
    }
    setIsOpen(false);
  };

  const ref = useOutsideClick(() => {
    setIsOpen(false);
    setSearchQuery("");
  });

  const sortedTokens = [
    ...tokens
      .filter(
        (token) =>
          parseFloat(token.balance) > 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokens
      .filter(
        (token) =>
          parseFloat(token.balance) <= 0 &&
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
  ];

  return (
    <div className="token-dropdown" ref={ref}>
      <div
        className={cx(
          "token-dropdown--row-container",
          isOpen && "opened",
          singleWhitelistedToken && "disabled"
        )}
        onClick={() => !singleWhitelistedToken && setIsOpen(!isOpen)}
      >
        <TokenDropdownRow token={token} />
        {!singleWhitelistedToken && (
          <div className={cx("caret", isOpen && "opened")}>
            <Icon icon="clarity:caret-line" />
          </div>
        )}
      </div>
      {isOpen && (
        <div className="token-dropdown--tokens">
          <div className="search-container">
            <input
              type="text"
              placeholder="Select collateral for deposit"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="token-dropdown--search"
            />
          </div>
          {sortedTokens.map((token) => (
            <TokenDropdownRow
              token={token}
              key={token.address}
              onClick={onTokenDropdownRowClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;
