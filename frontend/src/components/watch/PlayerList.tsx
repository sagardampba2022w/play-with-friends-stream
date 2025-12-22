import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { ActivePlayer } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerListProps {
  onSelectPlayer: (playerId: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ onSelectPlayer }) => {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
    
    // Refresh player list periodically
    const interval = setInterval(loadPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPlayers = async () => {
    const result = await api.getActivePlayers();
    if (result.success && result.data) {
      setPlayers(result.data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-mono animate-pulse">Loading players...</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-mono">No players currently online</p>
        <p className="text-sm text-muted-foreground mt-2">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <span className="font-mono text-sm text-muted-foreground">
          {players.length} player{players.length !== 1 ? 's' : ''} online
        </span>
      </div>

      <div className="grid gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mini snake preview */}
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden relative">
                  <div 
                    className="absolute inset-0 grid"
                    style={{ 
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gridTemplateRows: 'repeat(8, 1fr)',
                    }}
                  >
                    {Array.from({ length: 64 }).map((_, i) => {
                      const x = i % 8;
                      const y = Math.floor(i / 8);
                      const scaledSnake = player.snake.map(s => ({
                        x: Math.floor(s.x / 2.5),
                        y: Math.floor(s.y / 2.5),
                      }));
                      const isSnake = scaledSnake.some(s => s.x === x && s.y === y);
                      const scaledFood = {
                        x: Math.floor(player.food.x / 2.5),
                        y: Math.floor(player.food.y / 2.5),
                      };
                      const isFood = scaledFood.x === x && scaledFood.y === y;
                      
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-full h-full",
                            isSnake && "bg-primary",
                            isFood && "bg-neon-pink"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-foreground">
                      {player.username}
                    </span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-arcade text-primary">
                      {player.score.toLocaleString()}
                    </span>
                    <span className={cn(
                      "text-xs font-mono px-2 py-0.5 rounded",
                      player.mode === 'walls' 
                        ? "bg-neon-pink/20 text-neon-pink" 
                        : "bg-neon-cyan/20 text-neon-cyan"
                    )}>
                      {player.mode === 'walls' ? 'WALLS' : 'PT'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectPlayer(player.id)}
                className="font-mono text-xs gap-2"
              >
                <Eye className="w-4 h-4" />
                WATCH
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
