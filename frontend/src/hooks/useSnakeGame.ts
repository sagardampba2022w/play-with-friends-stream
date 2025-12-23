import { useState, useCallback, useEffect, useRef } from 'react';
import { Direction, GameMode, GameState, GameStatus, Position } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const getInitialSnake = (): Position[] => [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
};

export const createInitialState = (mode: GameMode = 'walls'): GameState => {
  const snake = getInitialSnake();
  return {
    snake,
    food: generateFood(snake),
    direction: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    speed: INITIAL_SPEED,
  };
};

export const moveSnake = (state: GameState): GameState => {
  if (state.status !== 'playing') return state;

  const head = { ...state.snake[0] };

  switch (state.direction) {
    case 'UP':
      head.y -= 1;
      break;
    case 'DOWN':
      head.y += 1;
      break;
    case 'LEFT':
      head.x -= 1;
      break;
    case 'RIGHT':
      head.x += 1;
      break;
  }

  // Handle wall collision based on mode
  if (state.mode === 'walls') {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return { ...state, status: 'game-over' };
    }
  } else {
    // Pass-through mode - wrap around
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;
  }

  // Check self collision
  if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return { ...state, status: 'game-over' };
  }

  const newSnake = [head, ...state.snake];
  let newFood = state.food;
  let newScore = state.score;
  let newSpeed = state.speed;

  // Check if food eaten
  if (head.x === state.food.x && head.y === state.food.y) {
    newScore += 10;
    newFood = generateFood(newSnake);
    // Increase speed every 50 points
    if (newScore % 50 === 0 && newSpeed > 50) {
      newSpeed -= 10;
    }
  } else {
    newSnake.pop();
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    score: newScore,
    speed: newSpeed,
  };
};

export const changeDirection = (state: GameState, newDirection: Direction): GameState => {
  if (state.status !== 'playing') return state;

  // Prevent 180-degree turns
  if (newDirection === getOppositeDirection(state.direction)) {
    return state;
  }

  return { ...state, direction: newDirection };
};

export const useSnakeGame = (initialMode: GameMode = 'walls') => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionQueueRef = useRef<Direction[]>([]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(prev.mode),
      status: 'playing',
    }));
    directionQueueRef.current = [];
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => createInitialState(prev.mode));
    directionQueueRef.current = [];
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...createInitialState(mode),
      mode,
    }));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keyDirectionMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT',
    };

    // Ignore if typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    const direction = keyDirectionMap[e.key];
    if (direction) {
      e.preventDefault();
      directionQueueRef.current.push(direction);
    }

    if (e.key === ' ') {
      e.preventDefault();
      pauseGame();
    }
  }, [pauseGame]);

  // Process direction queue and move snake
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        let newState = prev;

        // Process one direction from queue
        while (directionQueueRef.current.length > 0) {
          const nextDirection = directionQueueRef.current.shift()!;
          if (nextDirection !== getOppositeDirection(newState.direction)) {
            newState = changeDirection(newState, nextDirection);
            break;
          }
        }

        return moveSnake(newState);
      });
    }, gameState.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed]);

  // Add keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    gridSize: GRID_SIZE,
  };
};

export default useSnakeGame;
