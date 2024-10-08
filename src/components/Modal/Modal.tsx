import cx from "classnames";
import "./modal.scss";
import tellerLight from "../../assets/TellerLight.svg";
import tellerDark from "../../assets/TellerDark.svg";
import { Icon } from "@iconify/react";
import { ReactNode } from "react";
import ChainSwitch from "../ChainSwitch";

type ModalProps = {
  children: ReactNode;
  isWelcomeScreen?: boolean;
  useLightLogo?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  children,
  isWelcomeScreen,
  useLightLogo,
}: ModalProps) => {

  const tellerLogo = useLightLogo ? tellerLight : tellerDark;

  return (
    <div className="modal-container">
      <div className="modal-container-inner">
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
              {/* Remove close button if it's not necessary for a static component */}
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
                <span className="paragraph">Powered by</span>
                <img src={tellerLogo} className="logo" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
