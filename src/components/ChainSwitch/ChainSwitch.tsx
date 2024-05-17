import {
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
import { useAccount } from "wagmi";

import cx from "classnames";

import "./chainSwitch.scss";

const mapChainToImage: { [key: number]: string } = {
  [arbitrum.id]: "https://l2beat.com/icons/arbitrum.png",
  [optimism.id]: "https://l2beat.com/icons/optimism.png",
  [base.id]: "https://l2beat.com/icons/base.png",
  [blast.id]: "https://l2beat.com/icons/blast.png",
  [mantle.id]: "https://l2beat.com/icons/mantle.png",
  [linea.id]: "https://l2beat.com/icons/linea.png",
  [manta.id]: "https://l2beat.com/icons/mantapacific.png",
  [mode.id]: "https://l2beat.com/icons/mode.png",
  [polygon.id]: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  [mainnet.id]: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
};

const ChainSwitch: React.FC = () => {
  const { chain } = useAccount();
  const hasImage = !!chain?.id;
  const img = hasImage ? mapChainToImage[chain.id] : undefined;

  if (img === undefined) {
    return <></>;
  }

  return (
    <div className="chain-image">
      <img src={img} className={cx(!hasImage && "faded")} />
    </div>
  );
};

export default ChainSwitch;
