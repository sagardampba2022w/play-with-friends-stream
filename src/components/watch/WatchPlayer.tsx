import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import { ActivePlayer } from '@/types/game';
import GameBoard from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchPlayerProps {
  playerId: string | null;
  onBack: () => void;
}

const WatchPlayer: React.FC<WatchPlayerProps> = ({ playerId, onBack }) => {
  const [player, setPlayer] = useState<ActivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const loadPlayer = async () => {
      const result = await api.getActivePlayerById(playerId);
      if (result.success && result.data) {
        setPlayer(result.data);
      }
      setIsLoading(false);
    };

    loadPlayer();

    // Simulate player movement
    intervalRef.current = setInterval(() => {
      setPlayer(prev => {
        if (!prev || prev.status !== 'playing') return prev;
        return api.simulatePlayerMovement({ ...prev }, 20);
      });
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-mono animate-pulse">Loading player...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-mono mb-4">Player not found</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="font-mono text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <Users className="w-4 h-4 text-secondary" />
            <span className="font-mono text-sm text-foreground">{player.username}</span>
          </div>
          <div className="px-3 py-1.5 bg-destructive/20 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="font-arcade text-[10px] text-destructive">LIVE</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <GameBoard
        snake={player.snake}
        food={player.food}
        gridSize={20}
        status={player.status}
        mode={player.mode}
        isWatching
      />

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground font-mono mb-1">SCORE</p>
          <p className="font-arcade text-2xl text-primary text-glow-green">
            {player.score.toString().padStart(6, '0')}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground font-mono mb-1">MODE</p>
          <p className={cn(
            "font-arcade text-lg",
            player.mode === 'walls' ? "text-neon-pink" : "text-neon-cyan"
          )}>
            {player.mode === 'walls' ? 'WALLS' : 'PASS-THROUGH'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WatchPlayer;
