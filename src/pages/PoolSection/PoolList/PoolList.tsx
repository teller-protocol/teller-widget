import React from "react";
import "./poolList.scss";
import { useGetPoolSectionContext } from "../PoolSectionContext";
import Loader from "../../../components/Loader";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import { LenderGroupsPoolMetrics } from "../../../types/lenderGroupsPoolMetrics";

const PoolList: React.FC = () => {
  const { liquidityPoolsLoading: loading, liquidityPools } = useGetPoolSectionContext();
  console.log("liquidityPoolsLoading", loading);
  console.log("liquidityPools", liquidityPools);

  const isSupportedChain = useIsSupportedChain();

  const renderPool = (pool: LenderGroupsPoolMetrics) => (
    <div key={pool.id} className="pool-item">
      <div>Market ID: {pool.market_id}</div>
      <div>Max Loan Duration: {pool.max_loan_duration}</div>
      <div>Collateral Ratio: {pool.collateral_ratio}%</div>
      <div>Current Min Interest Rate: {pool.current_min_interest_rate}%</div>
      <div>Total Principal Committed: {pool.total_principal_tokens_committed}</div>
    </div>
  );

  return (
    <div className="pool-list-container">
      <h2>Available Pools</h2>
      <div className="pool-list">
        {isSupportedChain ? (
          <div>
            {loading ? (
              <Loader />
            ) : liquidityPools && liquidityPools.length > 0 ? (
              liquidityPools.map(renderPool)
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
