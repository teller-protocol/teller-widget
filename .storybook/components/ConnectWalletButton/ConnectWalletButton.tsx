import { useAccount, useConnect, useDisconnect } from "wagmi";

import "./styles.scss";
import { cutAddressString } from "../../../src/helpers/cutAddressString";

const ConnectWalletButton: React.FC = ({}) => {
  const { connectors, connect } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const WalletOptions = () => (
    <details className="wallet-options">
      <summary>
        <span>
          Please connect your wallet <br />
          to transact
        </span>
      </summary>
      <div className="wallet-options-connectors">
        {connectors.map((connector) => (
          <button key={connector?.uid} onClick={() => connect({ connector })}>
            {connector?.name}
          </button>
        ))}
      </div>
    </details>
  );

  return (
    <div className="connect-wallet-button">
      {address ? (
        <div>
          <div className="connected-wallet">
            <div className="address">Connected Address</div>
            <div className="address">{cutAddressString(address)}</div>
            <button onClick={() => disconnect()}>Disconnect</button>
          </div>
        </div>
      ) : (
        <WalletOptions />
      )}
    </div>
  );
};

export default ConnectWalletButton;
