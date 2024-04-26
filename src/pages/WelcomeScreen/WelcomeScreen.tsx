import { useAccount } from "wagmi";

import tellerLogoFull from "../../assets/tellerLogoFull.svg";
import Button from "../../components/Button";

import "./welcomeScreen.scss";

interface WelcomeScreenProps {
  onClick: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClick }) => {
  const { address } = useAccount();

  const handleOnClick = () => {
    localStorage.setItem("showTellerWidgetWelcomeScreen", "false");
    onClick();
  };
  return (
    <div className="welcome-screen">
      <img src={tellerLogoFull} alt="Teller logo" />
      <h1>DeFi's cash advance</h1>
      <div className="welcome-screen-text">
        Time-based loans, up to thirty days, with no margin-call liquidations.
      </div>
      <Button
        onClick={handleOnClick}
        label="Borrow now"
        isFullWidth
        disabled={!address}
      />
      {!address && (
        <div className="connect-wallet-error">Please connect your wallet</div>
      )}
    </div>
  );
};

export default WelcomeScreen;
