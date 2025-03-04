import cx from "classnames";

import "./modal.scss";

import tellerLight from "../../assets/TellerLight.svg";
import tellerDark from "../../assets/TellerDark.svg";
import link from "../../assets/link.svg";

import { Icon } from "@iconify/react";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import ChainSwitch from "../ChainSwitch";
import {
  useGetGlobalPropsContext,
  WIDGET_ACTION_ENUM,
} from "../../contexts/GlobalPropsContext";

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement("div");
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

type ModalProps = {
  children: ReactNode;
  closeModal?: () => void;
  showModal?: boolean;
  isWelcomeScreen?: boolean;
  useLightLogo?: boolean;
  isEmbedded?: boolean;
  showChainSwitch?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  children,
  closeModal,
  showModal,
  isWelcomeScreen,
  useLightLogo,
  isEmbedded,
  showChainSwitch,
}: ModalProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal?.();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleClose = useCallback(() => {
    closeModal?.();
  }, [closeModal]);

  const tellerLogo = useLightLogo ? tellerLight : tellerDark;

  const { widgetAction } = useGetGlobalPropsContext();

  const mapWidgetActionToTitle = useMemo(
    () => ({
      [WIDGET_ACTION_ENUM.BORROW]: "Borrow",
      [WIDGET_ACTION_ENUM.REPAY]: "My Loans",
      [WIDGET_ACTION_ENUM.POOL]: "Pools",
      [WIDGET_ACTION_ENUM.STRATEGIES]: "Strategies",
    }),
    []
  );

  const node = useMemo(
    () =>
      (showModal || isEmbedded) && (
        <div
          className={cx(
            "modal-container",
            !isEmbedded && "is-not-embedded-widget"
          )}
        >
          <div className="modal-container-inner">
            {isEmbedded ? null : (
              <div className="blur-container" aria-hidden="true">
                <div
                  className="blur"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    if (event.target === event.currentTarget) {
                      handleClose();
                    }
                  }}
                ></div>
              </div>
            )}
            <div
              className={cx(
                "modal-container-content",
                isWelcomeScreen && "is-welcome-screen"
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="modal-container-content-inner">
                {showChainSwitch && (
                  <div className="modal-content-title">
                    {!isWelcomeScreen && (
                      <div className="title-chain-container">
                        <div className="modal-title">
                          {
                            mapWidgetActionToTitle[
                              widgetAction as WIDGET_ACTION_ENUM
                            ]
                          }
                        </div>
                        <ChainSwitch />
                      </div>
                    )}
                    {!isEmbedded && (
                      <div className="close-button">
                        <Icon
                          icon="ci:close-big"
                          onClick={() => {
                            handleClose();
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                {children}
              </div>
              {!isWelcomeScreen && (
                <div className="modal-footer-logo">
                  <a
                    href="https://www.teller.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="paragraph">Powered by</span>
                    <img src={tellerLogo} className="logo" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    [
      children,
      handleClose,
      isEmbedded,
      isWelcomeScreen,
      mapWidgetActionToTitle,
      showChainSwitch,
      showModal,
      tellerLogo,
      widgetAction,
    ]
  );

  if (typeof document !== "undefined") {
    const portal = createWrapperAndAppendToBody("teller-widget");
    if (isEmbedded) return node;
    return ReactDOM.createPortal(node, portal);
  }
};

export default Modal;
