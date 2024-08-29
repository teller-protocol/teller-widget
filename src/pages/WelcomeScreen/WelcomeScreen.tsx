import { useAccount } from "wagmi";

import tellerLogoFull from "../../assets/tellerLogoFull.svg";
import Button from "../../components/Button";

import "./welcomeScreen.scss";
import { setItemInLocalStorage } from "../../helpers/localStorageUtils";

interface WelcomeScreenProps {
  onClick: () => void;
  welcomeScreenLogo?: string;
  welcomeScreenTitle?: string;
  welcomeScreenParagraph?: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onClick,
  welcomeScreenLogo,
  welcomeScreenTitle,
  welcomeScreenParagraph,
}) => {
  const handleOnClick = () => {
    setItemInLocalStorage("showTellerWidgetWelcomeScreen", "false");
    onClick();
  };
  return (
    <div className="welcome-screen">
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
