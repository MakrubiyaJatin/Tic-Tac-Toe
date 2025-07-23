import React, { useState, useEffect } from 'react';
import { socket } from './config/socket';
import GameBoard from './components/GameBoard';
import PlayerList from './components/PlayerList';
import ScoreBoard from './components/ScoreBoard';
import ConnectionStatus from './components/ConnectionStatus';
import Lobby from './components/Lobby';
import './App.css';

function App() {
  const [connectionStatus, setIsConnected] = useState(socket.connected);
  const [currentRoom, setRoomId] = useState(null);
  const [mySymbol, setPlayerSymbol] = useState(null);
  const [playerList, setPlayers] = useState({});
  const [boardState, setGameState] = useState(Array(9).fill(null));
  const [activePlayer, setCurrentPlayer] = useState('X');
  const [isGameRunning, setGameActive] = useState(false);
  const [gameScores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [statusMessage, setGameStatus] = useState('Waiting for players...');
  const [highlightedCells, setWinningCells] = useState([]);

  useEffect(() => {
    // Manually connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup function to remove all listeners
    const cleanup = () => {
      ['connect', 'disconnect', 'room-created', 'room-joined', 
       'room-full', 'room-not-found', 'player-joined', 'player-left',
       'game-start', 'move-made', 'game-reset', 'game-over', 
       'game-paused'].forEach(event => {
        socket.off(event);
      });
    };

    return cleanup;
  }, []);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    // Room management handlers
    const handleNewRoom = (data) => {
      setRoomId(data.roomId);
      setPlayerSymbol('X'); // First player is always X
      setGameStatus('Waiting for another player...');
    };
    
    const handleJoinRoom = (data) => {
      setRoomId(data.roomId);
      setPlayerSymbol(data.playerSymbol);
      updateGameStatus(data.playerCount);
    };
    
    const handleRoomError = (type) => {
      const messages = {
        full: 'This room is full. Try another one!',
        notFound: 'Could not find that room. Double check the code.'
      };
      alert(messages[type] || 'Room error occurred');
    };
    
    // Player management handlers
    const updatePlayers = (data) => {
      setPlayers(data.players);
      updateGameStatus(data.playerCount);
    };
    
    const handlePlayerDisconnect = (data) => {
      setPlayers(data.players);
      if (isGameRunning) {
        pauseGame('Other player left. Game paused.');
      }
    };
    
    const startGameHandler = () => initGame();
    
    const processMove = (data) => {
      const updatedBoard = [...boardState];
      updatedBoard[data.index] = data.playerSymbol;
      setGameState(updatedBoard);
      setCurrentPlayer(data.nextPlayer);
    };
    
    const resetHandler = () => prepareNewGame();
    
    const finishGame = (data) => {
      setGameActive(false);
      setScores(data.scores);
      setWinningCells(data.winningCells || []);
      
      setGameStatus(
        data.winner === 'draw' 
          ? "Game ended in a tie!" 
          : `${data.winner} won this round!`
      );
    };
    
    const pauseGameHandler = (message) => {
      setGameActive(false);
      setGameStatus(message);
    };

    const updateGameStatus = (count) => {
      if (count === 2) {
        initGame();
      } else {
        setGameStatus('Need one more player to start...');
      }
    };

    // Register all event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-created', handleNewRoom);
    socket.on('room-joined', handleJoinRoom);
    socket.on('room-full', () => handleRoomError('full'));
    socket.on('room-not-found', () => handleRoomError('notFound'));
    socket.on('player-joined', updatePlayers);
    socket.on('player-left', handlePlayerDisconnect);
    socket.on('game-start', startGameHandler);
    socket.on('move-made', processMove);
    socket.on('game-reset', resetHandler);
    socket.on('game-over', finishGame);
    socket.on('game-paused', pauseGameHandler);

    // Cleanup function for effect
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room-created', handleNewRoom);
      socket.off('room-joined', handleJoinRoom);
      socket.off('room-full');
      socket.off('room-not-found');
      socket.off('player-joined', updatePlayers);
      socket.off('player-left', handlePlayerDisconnect);
      socket.off('game-start', startGameHandler);
      socket.off('move-made', processMove);
      socket.off('game-reset', resetHandler);
      socket.off('game-over', finishGame);
      socket.off('game-paused', pauseGameHandler);
    };
  }, [isGameRunning, boardState]);

  // Initialize new game
  const initGame = () => {
    setGameState(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinningCells([]);
    setGameActive(true);
    setGameStatus("Game is live!");
  };

  // Prepare for new round
  const prepareNewGame = () => {
    setGameState(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinningCells([]);
    setGameActive(true);
    setGameStatus("New round started");
  };

  // Pause game with message
  const pauseGame = (message) => {
    setGameActive(false);
    setGameStatus(message);
  };

  // Room management functions
  const createNewRoom = () => {
    socket.emit('create-room');
  };

  const joinExistingRoom = (roomCode) => {
    socket.emit('join-room', roomCode);
  };

  // Game action functions
  const makeMove = (index) => {
    socket.emit('move', { index, roomId: currentRoom });
  };

  const requestReset = () => {
    socket.emit('reset-game', { roomId: currentRoom });
  };

  // Render lobby if not in a room
  if (!currentRoom) {
    return (
      <div className="app">
        <header>
          <h1>Tic-Tac-Toe</h1>
        </header>
        <main>
          <Lobby 
            onCreateRoom={createNewRoom} 
            onJoinRoom={joinExistingRoom} 
          />
          <ConnectionStatus isConnected={connectionStatus} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Tic-Tac-Toe Online</h1>
        <p>Room: {currentRoom} | Your symbol: {mySymbol}</p>
      </header>
      
      <main>
        <div className="game-container">
          <div className="game-panel">
            <div className="game-header">
              <div className="player-turn">
                <span>Now playing:</span>
                <div className={`player-badge ${activePlayer.toLowerCase()}`} />
                <span>{activePlayer}</span>
              </div>
              <div className="game-status-message">{statusMessage}</div>
              <button 
                className="btn restart-button" 
                onClick={requestReset}
                disabled={!isGameRunning && statusMessage.includes('Waiting')}
              >
                {isGameRunning ? 'Restart' : 'New Game'}
              </button>
            </div>
            <GameBoard 
              gameState={boardState}
              currentPlayer={activePlayer}
              playerSymbol={mySymbol}
              gameActive={isGameRunning}
              onMove={makeMove}
              winningCells={highlightedCells}
            />
          </div>
          
          <div className="sidebar">
            <div className="panel players-panel">
              <h2>Players in room</h2>
              <PlayerList players={playerList} currentPlayerId={socket.id} />
              <ConnectionStatus isConnected={connectionStatus} />
            </div>
            
            <div className="panel scores-panel">
              <h2>Game scores</h2>
              <ScoreBoard scores={gameScores} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;