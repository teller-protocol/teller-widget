import confirmationAsset from "../../assets/confirmation.svg";
import confirmationBackground from "../../assets/confirmation_background.png";
import externalLink from "../../assets/external_link.svg";
import Button from "../../components/Button";
import { useChainData } from "../../hooks/useChainData";
import Loader from "../Loader";

import "./confirmationLayout.scss";

const LabelWithIcon = ({ label }: { label: string }) => (
  <div className="label-with-icon">
    {label} <img src={externalLink} />
  </div>
);

interface ConfirmationLayoutProps {
  title: string;
  bidId?: string;
  txHash?: string;
}

const ConfirmationLayout: React.FC<ConfirmationLayoutProps> = ({
  title,
  bidId,
  txHash,
}) => {
  const { chainExplorerURL, chainName } = useChainData();

  return (
    <div className="confirmation-layout">
      <img
        src={confirmationBackground}
        className="confirmation-layout-background"
      />
      {/*<img src={confirmationAsset} className="confirmation-layout-main-image" />*/}
      <div className="confirmation-layout-title">{title}</div>
      <div className="confirmation-layout-buttons">
        {!txHash ? (
          <div className="loader-container">
            <Loader isSkeleton height={40} />
            <Loader isSkeleton height={40} />
          </div>
        ) : (
          <>
            <Button isFullWidth variant="secondary">
              <a
                href={`${chainExplorerURL}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View transaction" />
              </a>
            </Button>
            <Button isFullWidth variant="secondary">
              <a
                href={`https://app.teller.org/${chainName?.toLocaleLowerCase()}/loan/${bidId}`}
                target="_blank"
                rel="noreferrer"
              >
                <LabelWithIcon label="View cash advance" />
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmationLayout;
