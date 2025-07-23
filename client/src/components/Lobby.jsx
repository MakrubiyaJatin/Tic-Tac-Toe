import React, { useState } from 'react';

const Lobby = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="lobby">
      <h2>Game Lobby</h2>
      <p>Create a new room or join with a code</p>
      
      <div className="room-controls">
        <button className="btn create-btn" onClick={onCreateRoom}>
          Create New Room
        </button>
        
        <div className="join-section">
          <input 
            type="text" 
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code"
          />
          <button 
            className="btn join-btn"
            onClick={() => onJoinRoom(roomCode)}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;