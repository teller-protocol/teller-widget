import React from "react";
import PoolRow from "../../../components/PoolRow";
import "./poolList.scss";
import { useGetPoolSectionContext } from "../PoolSectionContext";
import Loader from "../../../components/Loader";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";

const PoolList: React.FC = () => {
  const { liquidityPoolsLoading: loading, liquidityPools } = useGetPoolSectionContext();
  const isSupportedChain = useIsSupportedChain();

  return (
    <div className="pool-list-container">
      <div className="pool-list">
        {isSupportedChain ? (
          <div>
            {loading ? (
              <Loader />
            ) : liquidityPools && liquidityPools.length > 0 ? (
              liquidityPools.map((pool) => (
                <PoolRow
                  pool={pool}
                />
              ))
            ) : (
              <div className="section-title">No pools available</div>
            )}
          </div>
        ) : (
          <div className="unsupported-chain">This chain is not supported</div>
        )}
      </div>
    </div>
  );
};

export default PoolList;
