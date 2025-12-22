import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PlayerList from '@/components/watch/PlayerList';
import WatchPlayer from '@/components/watch/WatchPlayer';
import { Eye } from 'lucide-react';

const Watch: React.FC = () => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Watch Players - Snake Game</title>
        <meta name="description" content="Watch other players play Snake game live. Learn from the best and see their strategies!" />
      </Helmet>

      <main className="container py-8">
        {!selectedPlayerId && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Eye className="w-8 h-8 text-secondary" />
              <h1 className="font-arcade text-2xl sm:text-3xl text-primary text-glow-green">
                WATCH LIVE
              </h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              Spectate other players in real-time
            </p>
          </div>
        )}

        {selectedPlayerId ? (
          <WatchPlayer
            playerId={selectedPlayerId}
            onBack={() => setSelectedPlayerId(null)}
          />
        ) : (
          <PlayerList onSelectPlayer={setSelectedPlayerId} />
        )}
      </main>
    </>
  );
};

export default Watch;
