import React from 'react';

const ConnectionStatus = ({ isConnected }) => {
  return (
    <div className="connection-status">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
      <span>{isConnected ? 'Connected to server' : 'Disconnected from server'}</span>
    </div>
  );
};

export default ConnectionStatus;