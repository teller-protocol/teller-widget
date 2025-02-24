import React from "react";
import PoolList from "./PoolList";
import "./poolSection.scss";
import { PoolSectionContextProvider } from "./PoolSectionContext";
import { useChainId } from "wagmi";

const PoolSection: React.FC = () => {
  const chainId = useChainId();
  return (
    <PoolSectionContextProvider>
      <div className="pool-section">
        <PoolList key={chainId} />
      </div>
    </PoolSectionContextProvider>
  );
};

export default PoolSection;
