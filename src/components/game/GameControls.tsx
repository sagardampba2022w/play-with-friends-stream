import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode, GameStatus } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  status,
  mode,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] mx-auto">
      {/* Score Display */}
      <div className="flex justify-center">
        <div className="bg-card border border-border rounded-lg px-8 py-4 box-glow-green">
          <p className="text-xs text-muted-foreground font-mono mb-1">SCORE</p>
          <p className="font-arcade text-3xl text-primary text-glow-green">
            {score.toString().padStart(6, '0')}
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === 'walls' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          disabled={status === 'playing'}
          className={cn(
            "font-arcade text-[10px]",
            mode === 'walls' && "box-glow-pink"
          )}
        >
          WALLS
        </Button>
        <Button
          variant={mode === 'pass-through' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onModeChange('pass-through')}
          disabled={status === 'playing'}
          className={cn(
            "font-arcade text-[10px]",
            mode === 'pass-through' && "box-glow-cyan"
          )}
        >
          PASS-THROUGH
        </Button>
      </div>

      {/* Game Controls */}
      <div className="flex gap-3 justify-center">
        {status === 'idle' || status === 'game-over' ? (
          <Button
            variant="arcade"
            size="lg"
            onClick={onStart}
            className="min-w-[140px]"
          >
            <Play className="w-5 h-5" />
            START
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            onClick={onPause}
            className="min-w-[140px]"
          >
            {status === 'paused' ? (
              <>
                <Play className="w-5 h-5" />
                RESUME
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                PAUSE
              </>
            )}
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          disabled={status === 'idle'}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground font-mono space-y-1">
        <p>Use <span className="text-foreground">ARROW KEYS</span> or <span className="text-foreground">WASD</span> to move</p>
        <p>Press <span className="text-foreground">SPACE</span> to pause</p>
      </div>
    </div>
  );
};

export default GameControls;
