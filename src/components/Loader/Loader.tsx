import tellerLogo from "../../assets/TellerLogo.png";
import "./loader.scss";

interface LoaderProps {
  loading?: boolean;
  isSkeleton?: boolean;
  height?: number;
}

const Loader: React.FC<LoaderProps> = ({
  loading = true,
  isSkeleton,
  height,
}) => {
  return (
    loading && (
      <>
        {isSkeleton ? (
          <div className="skeleton-loader" style={{ height: `${height}px` }} />
        ) : (
          <div className="loader">
            <img src={tellerLogo} />
          </div>
        )}
      </>
    )
  );
};

export default Loader;
