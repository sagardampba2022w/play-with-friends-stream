import React from 'react';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const SnakeGame: React.FC = () => {
  const { gameState, startGame, pauseGame, resetGame, setMode, gridSize } = useSnakeGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const prevStatusRef = React.useRef(gameState.status);

  // Submit score when game ends
  React.useEffect(() => {
    if (prevStatusRef.current === 'playing' && gameState.status === 'game-over') {
      if (user && gameState.score > 0) {
        api.submitScore(gameState.score, gameState.mode).then(result => {
          if (result.success) {
            toast({
              title: "Score Submitted!",
              description: `Your score of ${gameState.score} has been recorded.`,
            });
          }
        });
      }
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status, gameState.score, gameState.mode, user, toast]);

  return (
    <div className="flex flex-col gap-8 py-8">
      <GameBoard
        snake={gameState.snake}
        food={gameState.food}
        gridSize={gridSize}
        status={gameState.status}
        mode={gameState.mode}
      />
      <GameControls
        status={gameState.status}
        mode={gameState.mode}
        score={gameState.score}
        onStart={startGame}
        onPause={pauseGame}
        onReset={resetGame}
        onModeChange={setMode}
      />
    </div>
  );
};

export default SnakeGame;
