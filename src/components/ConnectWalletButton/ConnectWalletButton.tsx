import { useAccount, useConnect, useDisconnect } from "wagmi";
import { walletConnect } from "wagmi/connectors";

const ConnectWalletButton = () => {
  const { connectors, connect } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const WalletOptions = () => (
    <>
      {connectors.map((connector) => (
        <button key={connector?.uid} onClick={() => connect({ connector })}>
          {connector?.name}
        </button>
      ))}
      <button
        onClick={() =>
          connect({
            connector: walletConnect({
              projectId: "1c82ac0d6e7e111ef9f9476c00f3c0fa",
              disableProviderPing: false,
            }),
          })
        }
      >
        WalletConnect
      </button>
    </>
  );

  return (
    <>
      {address ? (
        <div>
          {address}
          <div>
            <button onClick={() => disconnect()}>Disconnect</button>
          </div>
        </div>
      ) : (
        <WalletOptions />
      )}
    </>
  );
};

export default ConnectWalletButton;
