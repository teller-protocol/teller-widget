import React from "react";
import PoolRow from "../../../components/PoolRow";
import "./poolList.scss";
import { useGetPoolSectionContext } from "../PoolSectionContext";
import Loader from "../../../components/Loader";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import { useChainData } from "../../../hooks/useChainData";

const PoolList: React.FC = () => {
  const { liquidityPoolsLoading: loading, liquidityPools } = useGetPoolSectionContext();
  const isSupportedChain = useIsSupportedChain();
  const { chainName } = useChainData();

  return (
    <div className="pool-list-container">
      <div className="pool-list">
        {isSupportedChain ? (
          <div>
            {loading ? (
              <Loader />
            ) : liquidityPools && liquidityPools.length > 0 ? (
              liquidityPools.map((pool) => {
                const handleClick = () => {
                  window.open(
                    `https://app.teller.org/${chainName?.toLocaleLowerCase().replace(/\s+/g, '-')}/lend/pool/${pool?.id}`, 
                    '_blank', 
                    'noopener,noreferrer'
                  );
                };
                return (
                  <div onClick={handleClick} style={{ cursor: 'pointer' }} key={pool.group_pool_address}>
                    <PoolRow pool={pool} />
                  </div>
                );
              })
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
