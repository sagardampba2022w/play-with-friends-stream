import React from 'react';
import { Helmet } from 'react-helmet-async';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { Trophy } from 'lucide-react';

const Leaderboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Leaderboard - Snake Game</title>
        <meta name="description" content="View the top Snake game players. Compete for the highest score in walls mode or pass-through mode!" />
      </Helmet>

      <main className="container py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-neon-yellow" />
            <h1 className="font-arcade text-2xl sm:text-3xl text-primary text-glow-green">
              LEADERBOARD
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm">
            Top players ranked by score
          </p>
        </div>

        <LeaderboardTable />
      </main>
    </>
  );
};

export default Leaderboard;
