import { useAccount } from "wagmi";

import tellerLogoFull from "../../assets/tellerLogoFull.svg";
import Button from "../../components/Button";

import "./welcomeScreen.scss";
import { setItemInLocalStorage } from "../../helpers/localStorageUtils";

import { Icon } from "@iconify/react";

interface WelcomeScreenProps {
  handleClose?: () => void;
  welcomeScreenLogo?: string;
  welcomeScreenTitle?: string;
  welcomeScreenParagraph?: string;
  onClick?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleClose,
  welcomeScreenLogo,
  welcomeScreenTitle,
  welcomeScreenParagraph,
  onClick,
}) => {
  const handleOnClick = () => {
    setItemInLocalStorage("showTellerWidgetWelcomeScreen", "false");
    onClick?.();
  };
  return (
    <div className="welcome-screen">
      <div className="close-button">
        <Icon
          icon="ci:close-big"
          onClick={() => {
            handleClose?.();
          }}
        />
      </div>
      <img src={welcomeScreenLogo ?? tellerLogoFull} alt="Logo" />

      <h1>{welcomeScreenTitle ?? "DeFi's cash advance"}</h1>

      <div className="welcome-screen-text">
        {welcomeScreenParagraph ??
          "Time-based loans, up to thirty days, with no margin-call liquidations."}
      </div>

      <Button onClick={handleOnClick} label="Borrow now" isFullWidth />
    </div>
  );
};

export default WelcomeScreen;
