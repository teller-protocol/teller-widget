import { useAccount, useConnect, useDisconnect } from "wagmi";

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
