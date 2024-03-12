import { useState } from "react";
import { useAccount } from "wagmi";
import Button from "../Button";
import Modal from "../Modal/Modal";
import "./widget.scss";

interface WidgetProps {
  buttonLabel?: string;
}

const Widget: React.FC<WidgetProps> = ({ buttonLabel = "Cash advance" }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="teller-widget">
      {showModal ? (
        <Modal closeModal={() => setShowModal(false)}>a</Modal>
      ) : (
        <Button label={buttonLabel} onClick={() => setShowModal(true)} />
      )}
    </div>
  );
};

export default Widget;
