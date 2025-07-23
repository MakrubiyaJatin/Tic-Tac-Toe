import React from 'react';

const ScoreBoard = ({ scores }) => {
  return (
    <div className="score-board">
      <div className="score-item">
        <div className="score-label">Player X</div>
        <div className="score-value score-x">{scores.X || 0}</div>
      </div>
      <div className="score-item">
        <div className="score-label">Draws</div>
        <div className="score-value score-draw">{scores.draw || 0}</div>
      </div>
      <div className="score-item">
        <div className="score-label">Player O</div>
        <div className="score-value score-o">{scores.O || 0}</div>
      </div>
    </div>
  );
};

export default ScoreBoard;