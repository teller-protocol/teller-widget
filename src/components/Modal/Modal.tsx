import cx from "classnames";

import "./modal.scss";

import tellerLogo from "../../assets/TellerLink.svg";

import { Icon } from "@iconify/react";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import ChainSwitch from "../ChainSwitch";

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement("div");
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

type ModalProps = {
  children: ReactNode;
  closeModal?: () => void;
  showModal: boolean;
  isWelcomeScreen?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  children,
  closeModal,
  showModal,
  isWelcomeScreen,
}: ModalProps) => {
  const portal = createWrapperAndAppendToBody("teller-widget");

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

  const node = useMemo(
    () =>
      showModal && (
        <div className="modal-container">
          <div className="modal-container-inner">
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
                <div className="modal-content-title">
                  {!isWelcomeScreen && (
                    <div className="title-chain-container">
                      <div className="modal-title">Cash Advance</div>
                      <ChainSwitch />
                    </div>
                  )}
                  <div className="close-button">
                    <Icon
                      icon="ci:close-big"
                      onClick={() => {
                        handleClose();
                      }}
                    />
                  </div>
                </div>
                {children}
              </div>
              {!isWelcomeScreen && (
                <div className="modal-footer-logo">
                  <a
                    href="https://www.teller.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={tellerLogo} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    [children, handleClose, isWelcomeScreen, showModal]
  );

  return ReactDOM.createPortal(node, portal);
};

export default Modal;
