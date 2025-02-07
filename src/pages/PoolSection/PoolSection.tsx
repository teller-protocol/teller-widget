import React from 'react';
import PoolList from "./PoolList";
import "./poolSection.scss";
import {
  PoolSectionContextProvider,
} from "./PoolSectionContext";

const PoolSection: React.FC = () => {
  return (
    <PoolSectionContextProvider>
      <div className="pool-section">
        <div>Pools</div>
        <PoolList />
      </div>
    </PoolSectionContextProvider>
  );
};

export default PoolSection;
