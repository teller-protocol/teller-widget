import { useState } from "react";
import cx from "classnames";

import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import defaultTokenImage from "../../assets/generic_token-icon.svg";

import "./tokenDropdown.scss";
import { useGetBorrowSectionContext } from "../../pages/BorrowSection/BorrowSectionContext";
import useOutsideClick from "../../hooks/useOutsideClick";
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

  return (
    <div className="token-dropdown--row" onClick={() => onClick?.(token)}>
      <TokenLogo logoUrl={logoUrl} size={32} />
      <div className="token-info">
        <div className="paragraph">{token?.symbol}</div>
        <div className="section-sub-title">
          Balance: {Number(token?.balance).toFixed(3)} {token?.symbol}
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
  const { setSelectedCollateralToken } = useGetBorrowSectionContext();

  const onTokenDropdownRowClick = (token: UserToken) => {
    setSelectedCollateralToken(token);
    setIsOpen(false);
  };

  const ref = useOutsideClick(() => setIsOpen(false));

  return (
    <div className="token-dropdown" ref={ref}>
      <div
        className={cx("token-dropdown--row-container", isOpen && "opened")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TokenDropdownRow token={token} />
        <div className={cx("caret", isOpen && "opened")}>
          <Icon icon="clarity:caret-line" />
        </div>
      </div>
      {isOpen && tokens.length > 0 && (
        <div className="token-dropdown--tokens">
          {tokens.map((token) => (
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
