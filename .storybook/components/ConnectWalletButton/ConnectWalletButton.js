import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import "./styles.scss";
import { cutAddressString } from "../../../src/helpers/cutAddressString";
const ConnectWalletButton = ({}) => {
    const { connectors, connect } = useConnect();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const WalletOptions = () => (_jsxs("details", { className: "wallet-options", children: [_jsx("summary", { children: _jsxs("span", { children: ["A connected wallet is required to transact. ", _jsx("br", {}), "Click here to connect your wallet."] }) }), _jsx("div", { className: "wallet-options-connectors", children: connectors.map((connector) => (_jsx("button", { onClick: () => connect({ connector }), children: connector?.name }, connector?.uid))) })] }));
    return (_jsx("div", { className: "connect-wallet-button", children: address ? (_jsx("div", { children: _jsxs("div", { className: "connected-wallet", children: [_jsx("div", { className: "address", children: "Connected Address" }), _jsx("div", { className: "address", children: cutAddressString(address) }), _jsx("button", { onClick: () => disconnect(), children: "Disconnect" })] }) })) : (_jsx(WalletOptions, {})) }));
};
export default ConnectWalletButton;
