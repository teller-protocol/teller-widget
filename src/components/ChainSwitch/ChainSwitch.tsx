import {
  Chain,
  arbitrum,
  base,
  blast,
  linea,
  mainnet,
  manta,
  mantle,
  mode,
  optimism,
  polygon,
} from "viem/chains";
import { useChainId, useSwitchChain } from "wagmi";
import arbitrumIcon from "../../assets/arbitrum.png";
import baseIcon from "../../assets/base.png";
import mainnetIcon from "../../assets/mainnet.png";
import polygonIcon from "../../assets/polygon.png";

import cx from "classnames";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import "./chainSwitch.scss";

interface ChainDropdownRowProps {
  chain: Chain;
}

const mapChainToImage: { [key: number]: string } = {
  [arbitrum.id]: arbitrumIcon,
  [optimism.id]: "https://l2beat.com/icons/optimism.png",
  [base.id]: baseIcon,
  [blast.id]: "https://l2beat.com/icons/blast.png",
  [mantle.id]: "https://l2beat.com/icons/mantle.png",
  [linea.id]: "https://l2beat.com/icons/linea.png",
  [manta.id]: "https://l2beat.com/icons/mantapacific.png",
  [mode.id]: "https://l2beat.com/icons/mode.png",
  [polygon.id]: polygonIcon,
  [mainnet.id]: mainnetIcon,
};

const supportedChains = [arbitrum, base, polygon, mainnet];

const ChainDropdownRow: React.FC<ChainDropdownRowProps> = ({ chain }) => {
  const { switchChain } = useSwitchChain();
  const img = mapChainToImage[chain.id];

  return (
    <div
      className="chain-dropdown-row"
      onClick={() => switchChain({ chainId: chain.id })}
    >
      <img src={img} />
    </div>
  );
};

const ChainSwitch: React.FC = () => {
  const chainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  const hasImage = !!chainId;
  const img = hasImage ? mapChainToImage[chainId] : undefined;
  const { whitelistedChains } = useGetGlobalPropsContext();

  const ref = useOutsideClick(() => setIsOpen(false));

  const filteredChains = whitelistedChains
    ? supportedChains.filter((c) => whitelistedChains?.includes(c.id))
    : supportedChains;

  const visibleChains = filteredChains.filter((c) => c.id !== chainId);

  const isSingleChain = visibleChains.length === 0;

  return (
    <div className="chain-image">
      <div
        className={cx("chain-dropdown", isOpen && "opened")}
        onClick={() => setIsOpen(!isOpen)}
        ref={ref}
      >
        <img src={img} className={cx(!hasImage && "faded")} />
        {!isSingleChain && (
          <div className={cx("caret", isOpen && "opened")}>
            <Icon icon="clarity:caret-line" />
          </div>
        )}
        {isOpen && !isSingleChain && (
          <div className="chain-dropdown-row-container">
            {visibleChains.map((chain) => (
              <ChainDropdownRow chain={chain} key={chain.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainSwitch;
