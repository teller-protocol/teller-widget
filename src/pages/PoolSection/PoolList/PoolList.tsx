import React from "react";
import "./poolList.scss";
import { useGetPoolSectionContext } from "../PoolSectionContext";
import Loader from "../../../components/Loader";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";

const PoolList: React.FC = () => {
  const { liquidityPoolsLoading: loading, liquidityPools } = useGetPoolSectionContext();
  console.log("liquidityPoolsLoading", loading);
  console.log("liquidityPools", liquidityPools);

  const isSupportedChain = useIsSupportedChain();

  return (
    <div>
      Pool list:
      <div className="pool-list">
        {isSupportedChain ? (
          <div>
            {loading ? (
              <Loader />
            ) : liquidityPools.length > 0 ? (
              liquidityPools.map((pool, index) => (
                <div key={index} className="pool-item">
                  {JSON.stringify(pool)} {/* Convert object to string for debugging */}
                </div>
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
