import React from 'react';

const PlayerList = ({ players = {}, currentPlayerId = '' }) => {
  // Early return if no players
  if (Object.keys(players).length === 0) {
    return (
      <div className="empty-state">
        <p>Waiting for players to join...</p>
      </div>
    );
  }

  return (
    <div className="players-container">
      {Object.entries(players).map(([socketId, playerData]) => {
        const isYou = socketId === currentPlayerId;
        const statusText = playerData.status === 'online' 
          ? 'Connected' 
          : 'Disconnected';

        return (
          <div 
            key={socketId} 
            className={`player-card ${isYou ? 'highlight-you' : ''}`}
          >
            <div className="player-info">
              <span className="player-badge">
                {playerData.symbol}
              </span>
              <span>
                {isYou ? 'You' : `Player ${playerData.symbol}`}
              </span>
            </div>
            
            <div className={`connection-status ${playerData.status}`}>
              {statusText}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerList;