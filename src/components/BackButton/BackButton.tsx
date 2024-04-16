import caret from "../../assets/right-caret.svg";

import "./backButton.scss";

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="back-button">
      <img src={caret} alt="caret" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
