import "./modal.scss";

import { Icon } from "@iconify/react";
import { ReactNode, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement("div");
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

type ModalProps = {
  children: ReactNode;
  closeModal?: () => void;
};

const Modal = ({ children, closeModal }: ModalProps) => {
  const portal = createWrapperAndAppendToBody("teller-widget");

  const handleClose = useCallback(() => {
    closeModal?.();
  }, [closeModal]);

  const node = useMemo(
    () => (
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
            className="modal-container-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div>
              <div className="modal-content-title">
                <div className="modal-title">Cash Advance</div>
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
          </div>
        </div>
      </div>
    ),
    []
  );

  return createPortal(node, portal);
};

export default Modal;
