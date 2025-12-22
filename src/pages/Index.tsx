import React from 'react';
import { Helmet } from 'react-helmet-async';
import SnakeGame from '@/components/game/SnakeGame';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Snake Game - Classic Arcade Fun</title>
        <meta name="description" content="Play the classic Snake game with modern neon graphics. Choose between walls mode and pass-through mode. Compete on the leaderboard!" />
      </Helmet>

      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="font-arcade text-3xl sm:text-4xl text-primary text-glow-green mb-2">
            SNAKE
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Classic arcade game with a neon twist
          </p>
        </div>

        <SnakeGame />
      </main>
    </>
  );
};

export default Index;
