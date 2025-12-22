import React from 'react';
import { Position, GameStatus, GameMode } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  status: GameStatus;
  mode: GameMode;
  isWatching?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  food,
  gridSize,
  status,
  mode,
  isWatching = false,
}) => {
  const cellSize = 100 / gridSize;

  const isSnakeCell = (x: number, y: number) => {
    return snake.some(segment => segment.x === x && segment.y === y);
  };

  const isHead = (x: number, y: number) => {
    return snake[0]?.x === x && snake[0]?.y === y;
  };

  const isFood = (x: number, y: number) => {
    return food.x === x && food.y === y;
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto">
      {/* Game board container */}
      <div
        className={cn(
          "relative w-full h-full rounded-lg overflow-hidden scanlines crt-flicker",
          mode === 'walls' 
            ? "border-4 border-neon-pink box-glow-pink" 
            : "border-4 border-neon-cyan box-glow-cyan"
        )}
        style={{
          background: 'linear-gradient(135deg, hsl(220 20% 4%) 0%, hsl(220 20% 8%) 100%)',
        }}
      >
        {/* Grid */}
        <div className="absolute inset-0 grid" style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}>
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const isSnake = isSnakeCell(x, y);
            const isHeadCell = isHead(x, y);
            const isFoodCell = isFood(x, y);

            return (
              <div
                key={index}
                className={cn(
                  "transition-all duration-75",
                  isSnake && !isHeadCell && "snake-cell rounded-sm",
                  isHeadCell && "snake-cell rounded-md scale-110",
                  isFoodCell && "food-cell rounded-full scale-90",
                  !isSnake && !isFoodCell && "grid-cell"
                )}
              />
            );
          })}
        </div>

        {/* Game Over Overlay */}
        {status === 'game-over' && !isWatching && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center animate-slide-in">
              <h2 className="font-arcade text-2xl text-destructive text-glow-pink mb-4">
                GAME OVER
              </h2>
              <p className="text-muted-foreground font-mono">
                Press START to play again
              </p>
            </div>
          </div>
        )}

        {/* Idle Overlay */}
        {status === 'idle' && !isWatching && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center animate-slide-in">
              <h2 className="font-arcade text-xl text-primary text-glow-green mb-4">
                SNAKE
              </h2>
              <p className="text-muted-foreground font-mono animate-pulse-neon">
                Press START to begin
              </p>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {status === 'paused' && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center animate-slide-in">
              <h2 className="font-arcade text-xl text-secondary text-glow-cyan">
                PAUSED
              </h2>
              <p className="text-muted-foreground font-mono mt-2">
                Press SPACE to continue
              </p>
            </div>
          </div>
        )}

        {/* Watching indicator */}
        {isWatching && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-destructive/80 rounded text-xs font-arcade text-destructive-foreground">
            LIVE
          </div>
        )}
      </div>

      {/* Mode indicator */}
      <div className={cn(
        "absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-arcade",
        mode === 'walls' ? "text-neon-pink" : "text-neon-cyan"
      )}>
        {mode === 'walls' ? '⚠ WALLS MODE' : '∞ PASS-THROUGH'}
      </div>
    </div>
  );
};

export default GameBoard;
