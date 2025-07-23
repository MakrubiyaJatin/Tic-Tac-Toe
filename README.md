# Tic-Tac-Toe
Real-Time Tic-Tac-Toe Game

## Project Setup Guide

## Backend Setup

```bash
cd server
cp env.example .env
npm install
```

## Frontend Setup
```bash
cd client
cp env.example .env
npm install
```

## Environment Variables
### Server (.env):
PORT=5050

### Client (.env):
REACT_APP_SOCKET_URL = http://localhost:5050  

## Run App:
### Server
```bash
cd server && npm start
```
### Client
```bash
cd client && npm start
```

## Tech stack
Frontend: React.js

Backend: Node.js, Express.js, Socket.io

## Features
- Real-time multiplayer gameplay
- Room-based system with unique codes
- Score tracking for X, O, and draws
- Responsive design for all devices
- Connection status monitoring
- Player disconnection handling

## How to Play
### Creating a Game
- Click "Create New Room" button
- Share the room code with your friend
- Wait for your friend to join

### Joining a Game
- Enter the room code from your friend
- Click "Join Room"
- You'll automatically be assigned as Player O

### Game Controls
- Restart Game: Resets the board but keeps the same players
- New Game: Creates a brand new game room




 
