import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';

const LeaderboardTable: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const result = await api.getLeaderboard(filter === 'all' ? undefined : filter);
    if (result.success && result.data) {
      setEntries(result.data);
    }
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-neon-pink" />;
      default:
        return <span className="text-muted-foreground font-mono">{rank}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Filter buttons */}
      <div className="flex gap-2 justify-center mb-6">
        {(['all', 'walls', 'pass-through'] as const).map((mode) => (
          <Button
            key={mode}
            variant={filter === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(mode)}
            className={cn(
              "font-arcade text-[10px]",
              filter === mode && mode === 'walls' && "box-glow-pink bg-neon-pink text-background",
              filter === mode && mode === 'pass-through' && "box-glow-cyan bg-neon-cyan text-background",
              filter === mode && mode === 'all' && "box-glow-green"
            )}
          >
            {mode === 'all' ? 'ALL' : mode === 'walls' ? 'WALLS' : 'PASS-THROUGH'}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_100px_80px_80px] gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <span className="font-arcade text-[10px] text-muted-foreground">RANK</span>
          <span className="font-arcade text-[10px] text-muted-foreground">PLAYER</span>
          <span className="font-arcade text-[10px] text-muted-foreground text-right">SCORE</span>
          <span className="font-arcade text-[10px] text-muted-foreground text-center">MODE</span>
          <span className="font-arcade text-[10px] text-muted-foreground text-right">DATE</span>
        </div>

        {/* Entries */}
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground font-mono animate-pulse">Loading...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground font-mono">No scores yet. Be the first!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "grid grid-cols-[60px_1fr_100px_80px_80px] gap-2 px-4 py-3 items-center transition-colors hover:bg-muted/30",
                  index < 3 && "bg-muted/20"
                )}
              >
                <div className="flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <span className={cn(
                    "font-mono font-bold",
                    index === 0 && "text-neon-yellow",
                    index === 1 && "text-muted-foreground",
                    index === 2 && "text-neon-pink"
                  )}>
                    {entry.username}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-arcade text-sm text-primary">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
                <div className="text-center">
                  <span className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded",
                    entry.mode === 'walls' 
                      ? "bg-neon-pink/20 text-neon-pink" 
                      : "bg-neon-cyan/20 text-neon-cyan"
                  )}>
                    {entry.mode === 'walls' ? 'W' : 'PT'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(entry.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;
