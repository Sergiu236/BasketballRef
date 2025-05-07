// src/components/StatusIndicator.tsx
import React, { useContext } from 'react';
import { RefereeContext } from '../context/RefereeContext';

const StatusIndicator: React.FC = () => {
  const { isOnline, serverUp, isSyncing } = useContext(RefereeContext);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <p>
        <strong>Network:</strong> {isOnline ? 'Online' : 'Offline'}
      </p>
      <p>
        <strong>Server:</strong> {serverUp ? 'Up' : 'Down'}
      </p>
      <p>
        <strong>Sync:</strong> {isSyncing ? 'Syncing…' : 'Idle'}
      </p>
    </div>
  );
};

export default StatusIndicator;
