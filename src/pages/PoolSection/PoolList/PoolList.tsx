// src/components/PoolList.tsx
import React, { useState, useMemo } from "react";
import PoolRow from "../../../components/PoolRow";
import Loader from "../../../components/Loader";
import { useGetPoolSectionContext } from "../PoolSectionContext";
import { useIsSupportedChain } from "../../../hooks/useIsSupportedChain";
import { useAugmentedPools } from "../../../hooks/queries/useGetAugmentedLiquidityPools";
import "./poolList.scss";

const PoolList: React.FC = () => {
  const { liquidityPoolsLoading: poolsLoading, liquidityPools } =
    useGetPoolSectionContext();
  const isSupportedChain = useIsSupportedChain();
  const [searchQuery, setSearchQuery] = useState("");

  // Get augmented pools and metadata loading status.
  const { augmentedPools, isLoading: metadataLoading } = useAugmentedPools(
    liquidityPools || []
  );
  // Combine pool loading and metadata loading.
  const isLoading = poolsLoading || metadataLoading;

  // Filter the augmented pools by token symbol based on the search query.
  const filteredPools = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return augmentedPools.filter(
      (pool) =>
        pool.principalTokenSymbol.toLowerCase().includes(query) ||
        pool.collateralTokenSymbol.toLowerCase().includes(query)
    );
  }, [augmentedPools, searchQuery]);

  return (
    <div className="pool-list-container">
      <div className="pool-list">
        {isSupportedChain ? (
          <div>
            <input
              type="text"
              placeholder="Select pool"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pool-search-input"
            />
            {isLoading ? (
              <Loader />
            ) : augmentedPools.length > 0 ? (
              filteredPools.length > 0 ? (
                filteredPools.map((pool, index) => (
                  // Use a unique key if available (e.g., pool.id); fallback to index.
                  <PoolRow key={pool.id || index} pool={pool} />
                ))
              ) : (
                <div className="section-title">
                  No pools match your search.
                </div>
              )
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
