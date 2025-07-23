const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = {};
const players = {};

// Helper function to check for a winner
const checkWinner = (board) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningCells: pattern
      };
    }
  }
  
  return null;
}

// Main connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  players[socket.id] = {
    roomId: null,
    symbol: null,
    status: 'online'
  };
  
  // Room creation
  socket.on('create-room', () => {
    const roomId = uuidv4();
    rooms[roomId] = {
      players: [socket.id],
      gameState: Array(9).fill(null),
      currentPlayer: 'X',
      scores: { X: 0, O: 0, draw: 0 },
      gameActive: false
    };
    
    players[socket.id].roomId = roomId;
    players[socket.id].symbol = 'X';
    
    socket.join(roomId);
    socket.emit('room-created', { roomId });
    updateRoomPlayers(roomId);
  });
  
  // Room joining
  socket.on('join-room', (roomId) => {
    const room = rooms[roomId];
    
    if (!room) {
      socket.emit('room-not-found');
      return;
    }
    
    if (room.players.length >= 2) {
      socket.emit('room-full');
      return;
    }
    
    room.players.push(socket.id);
    players[socket.id].roomId = roomId;
    players[socket.id].symbol = 'O';
    
    socket.join(roomId);
    socket.emit('room-joined', { 
      roomId, 
      playerSymbol: 'O',
      playerCount: room.players.length
    });
    
    updateRoomPlayers(roomId);
    
    if (room.players.length === 2) {
      room.gameActive = true;
      io.to(roomId).emit('game-start');
    }
  });
  
  // Move handling
  socket.on('move', ({ index, roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.gameActive) return;
    
    const player = players[socket.id];
    if (!player || player.symbol !== room.currentPlayer) return;
    
    if (room.gameState[index] !== null) return;
    
    room.gameState[index] = player.symbol;
    
    const winner = checkWinner(room.gameState);
    const isDraw = !winner && room.gameState.every(cell => cell !== null);
    
    room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
    
    io.to(roomId).emit('move-made', {
      index,
      playerSymbol: player.symbol,
      nextPlayer: room.currentPlayer
    });
    
    if (winner || isDraw) {
      room.gameActive = false;
      if (winner) {
        room.scores[winner.winner]++;
      } else {
        room.scores.draw++;
      }
      
      io.to(roomId).emit('game-over', {
        winner: winner ? winner.winner : 'draw',
        winningCells: winner ? winner.winningCells : [],
        scores: room.scores
      });
    }
  });
  
  // Game reset
  socket.on('reset-game', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    
    room.gameState = Array(9).fill(null);
    room.currentPlayer = 'X';
    room.gameActive = true;
    
    io.to(roomId).emit('game-reset');
  });
  
  // Disconnect handler 
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const player = players[socket.id];
    if (!player) return;
    
    const roomId = player.roomId;
    if (!roomId) return;
    
    const room = rooms[roomId];
    if (!room) return;
    
    room.players = room.players.filter(id => id !== socket.id);
    
    players[socket.id].status = 'offline';
    
    if (room.players.length > 0) {
      io.to(roomId).emit('player-left', { 
        players: getRoomPlayers(roomId),
        playerCount: room.players.length
      });
      
      if (room.gameActive) {
        room.gameActive = false;
        io.to(roomId).emit('game-paused', 'Opponent disconnected');
      }
    }
    
    if (room.players.length === 0) {
      delete rooms[roomId];
    }
    
    delete players[socket.id];
  });
  
  function updateRoomPlayers(roomId) {
    io.to(roomId).emit('player-joined', {
      players: getRoomPlayers(roomId),
      playerCount: rooms[roomId].players.length
    });
  }
  
  function getRoomPlayers(roomId) {
    const roomPlayers = {};
    rooms[roomId].players.forEach(playerId => {
      roomPlayers[playerId] = {
        symbol: players[playerId].symbol,
        status: players[playerId].status
      };
    });
    return roomPlayers;
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});