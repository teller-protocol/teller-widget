import { useState } from "react";
import cx from "classnames";
import { UserToken } from "../../hooks/useGetUserTokens";
import TokenLogo from "../TokenLogo";
import "./tokenDropdown.scss";
import { useGetBorrowSectionContext } from "../../pages/BorrowSection/BorrowSectionContext";
import {
  useGetGlobalPropsContext,
  STRATEGY_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import { numberWithCommasAndDecimals } from "../../helpers/numberUtils";
import { Icon } from "@iconify/react";
import { mapChainIdToName } from "../../constants/chains";
import { mapChainToImage } from "../ChainSwitch/ChainSwitch";
import { useTokenLogoAndSymbolWithFallback } from "../../hooks/useTokenLogoAndSymbolWithFallback";

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
  const logoAndSymbol = useTokenLogoAndSymbolWithFallback(token);

  const { isStrategiesSection, strategyAction } = useGetGlobalPropsContext();

  const isDisconnectedView = !!token.chainId;

  const subtitleData = (() => {
    if (!isStrategiesSection) {
      return {
        title: "Balance",
        value: Number(token?.balance).toFixed(3),
      };
    } else {
      if (strategyAction === STRATEGY_ACTION_ENUM.LONG) {
        return {
          title: "Long with",
          value: Number(token?.balance).toFixed(3),
        };
      } else if (strategyAction === STRATEGY_ACTION_ENUM.SHORT) {
        return {
          title: "Short up to",
          value: token?.balance,
        };
      } else if (strategyAction === STRATEGY_ACTION_ENUM.FARM) {
        return {
          title: "Farm up to",
          value: token?.balance,
        };
      } else {
        return {
          title: "Balance",
          value: Number(token?.balance).toFixed(3),
        };
      }
    }
  })();

  const handleOnDropdownRowClick = () => {
    window.dispatchEvent(
      new CustomEvent("teller-widget-token-selected", {
        detail: {
          token: token.address,
        },
      })
    );
    onClick?.({
      ...token,
      ...logoAndSymbol,
    });
  };

  if (!logoAndSymbol) return null;

  return (
    <div className="token-dropdown--row" onClick={handleOnDropdownRowClick}>
      <TokenLogo logoUrl={logoAndSymbol.logo} size={32} />
      <div className="token-info">
        <div className="paragraph">{logoAndSymbol.symbol}</div>
        <div className="section-sub-title">
          {isDisconnectedView ? (
            <span className="chain-info">
              {mapChainIdToName[token?.chainId ?? 0]}
              <img src={mapChainToImage[token?.chainId ?? 0]} />
            </span>
          ) : (
            `${numberWithCommasAndDecimals(subtitleData.value)} ${
              logoAndSymbol.symbol
            }`
          )}
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
  const { singleWhitelistedToken, strategyAction, switchChainManual } =
    useGetGlobalPropsContext();

  const { isStrategiesSection } = useGetGlobalPropsContext();

  const onTokenDropdownRowClick = (token: UserToken) => {
    if (!isStrategiesSection) {
      switchChainManual(token.chainId);
      setTimeout(() => {
        setSelectedCollateralToken(token);
      });
    } else {
      if (strategyAction === STRATEGY_ACTION_ENUM.LONG) {
        switchChainManual(token.chainId);
        setTimeout(() => {
          setSelectedCollateralToken(token);
        });
      } else {
        setSelectedPrincipalErc20Token(token);
      }
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
          parseFloat(token?.balance) > 0 &&
          token?.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ...tokens
      .filter(
        (token) =>
          parseFloat(token?.balance) <= 0 &&
          token?.symbol.toLowerCase().includes(searchQuery.toLowerCase())
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
              placeholder="Select token"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="token-dropdown--search"
            />
          </div>
          {sortedTokens.map((token) => (
            <TokenDropdownRow
              token={token}
              key={token?.address}
              onClick={onTokenDropdownRowClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;
