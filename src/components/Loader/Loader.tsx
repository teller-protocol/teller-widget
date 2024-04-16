import tellerLogo from "../../assets/TellerLogo.png";
import "./loader.scss";

interface LoaderProps {
  loading?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ loading = true }) => {
  return (
    loading && (
      <div className="loader">
        <img src={tellerLogo} />
      </div>
    )
  );
};

export default Loader;
