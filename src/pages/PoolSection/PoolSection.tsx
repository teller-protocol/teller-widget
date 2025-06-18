import React, { useEffect } from "react";
import PoolList from "./PoolList";
import "./poolSection.scss";
import { PoolSectionContextProvider } from "./PoolSectionContext";
import { useChainId } from "wagmi";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

const PoolSection: React.FC = () => {
  const { setIsSwitchingBetweenWidgetActions } = useGetGlobalPropsContext();

  useEffect(() => {
    setIsSwitchingBetweenWidgetActions(false);
  }, [setIsSwitchingBetweenWidgetActions]);

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
