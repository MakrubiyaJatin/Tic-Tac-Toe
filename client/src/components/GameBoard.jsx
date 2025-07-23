import React, { useEffect } from 'react';

const GameBoard = ({ 
  gameState, 
  currentPlayer, 
  playerSymbol, 
  gameActive, 
  onMove,
  winningCells
}) => {
  const handleCellClick = (index) => {
    console.log("index", index,gameActive,playerSymbol, gameState[index],currentPlayer, playerSymbol !== currentPlayer,!gameActive || gameState[index] !== null || playerSymbol !== currentPlayer )
    if (!gameActive || gameState[index] !== null || playerSymbol !== currentPlayer) {
      return;
    }
    onMove(index);
  };

  return (
    <div className="game-board">
      {gameState.map((cell, index) => (
        <div 
          key={index} 
          className={`cell ${cell ? cell.toLowerCase() : ''} ${winningCells.includes(index) ? 'win' : ''}`}
          onClick={() => handleCellClick(index)}
        >
          {cell}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;