import { describe, it, expect } from 'vitest';
import { createInitialState, moveSnake, changeDirection } from './useSnakeGame';
import { GameState, Direction } from '@/types/game';

describe('useSnakeGame', () => {
  describe('createInitialState', () => {
    it('should create initial state with walls mode by default', () => {
      const state = createInitialState();
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.direction).toBe('RIGHT');
      expect(state.snake.length).toBe(3);
    });

    it('should create initial state with pass-through mode when specified', () => {
      const state = createInitialState('pass-through');
      expect(state.mode).toBe('pass-through');
    });

    it('should generate food not on snake', () => {
      const state = createInitialState();
      const foodOnSnake = state.snake.some(
        segment => segment.x === state.food.x && segment.y === state.food.y
      );
      expect(foodOnSnake).toBe(false);
    });
  });

  describe('moveSnake', () => {
    it('should not move when status is not playing', () => {
      const state = createInitialState();
      const newState = moveSnake(state);
      expect(newState).toEqual(state);
    });

    it('should move snake in the current direction', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
      };
      const initialHead = { ...state.snake[0] };
      const newState = moveSnake(state);

      expect(newState.snake[0].x).toBe(initialHead.x + 1);
      expect(newState.snake[0].y).toBe(initialHead.y);
    });

    it('should move snake up correctly', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'UP',
      };
      const initialHead = { ...state.snake[0] };
      const newState = moveSnake(state);

      expect(newState.snake[0].y).toBe(initialHead.y - 1);
    });

    it('should move snake down correctly', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'DOWN',
      };
      const initialHead = { ...state.snake[0] };
      const newState = moveSnake(state);

      expect(newState.snake[0].y).toBe(initialHead.y + 1);
    });

    it('should move snake left correctly', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'LEFT',
        snake: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }],
      };
      const initialHead = { ...state.snake[0] };
      const newState = moveSnake(state);

      expect(newState.snake[0].x).toBe(initialHead.x - 1);
    });

    it('should game over when hitting wall in walls mode', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'LEFT',
        snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }],
      };
      const newState = moveSnake(state);

      expect(newState.status).toBe('game-over');
    });

    it('should wrap around in pass-through mode', () => {
      const state: GameState = {
        ...createInitialState('pass-through'),
        status: 'playing',
        direction: 'LEFT',
        snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }],
      };
      const newState = moveSnake(state);

      expect(newState.status).toBe('playing');
      expect(newState.snake[0].x).toBe(19); // Wrapped to other side
    });

    it('should wrap vertically in pass-through mode', () => {
      const state: GameState = {
        ...createInitialState('pass-through'),
        status: 'playing',
        direction: 'UP',
        snake: [{ x: 10, y: 0 }, { x: 10, y: 1 }, { x: 10, y: 2 }],
      };
      const newState = moveSnake(state);

      expect(newState.snake[0].y).toBe(19);
    });

    it('should game over on self collision', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'LEFT',
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 4, y: 6 },
          { x: 5, y: 6 },
          { x: 6, y: 6 },
          { x: 6, y: 5 },
        ],
      };
      const newState = moveSnake(state);

      expect(newState.status).toBe('game-over');
    });

    it('should increase score when eating food', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
        food: { x: 11, y: 10 },
      };
      const newState = moveSnake(state);

      expect(newState.score).toBe(10);
      expect(newState.snake.length).toBe(4);
    });

    it('should generate new food after eating', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
        food: { x: 11, y: 10 },
      };
      const newState = moveSnake(state);

      expect(newState.food).not.toEqual({ x: 11, y: 10 });
    });
  });

  describe('changeDirection', () => {
    it('should not change direction when status is not playing', () => {
      const state = createInitialState();
      const newState = changeDirection(state, 'UP');
      expect(newState.direction).toBe('RIGHT');
    });

    it('should change direction when valid', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
      };
      const newState = changeDirection(state, 'UP');
      expect(newState.direction).toBe('UP');
    });

    it('should not allow 180-degree turn from RIGHT to LEFT', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
      };
      const newState = changeDirection(state, 'LEFT');
      expect(newState.direction).toBe('RIGHT');
    });

    it('should not allow 180-degree turn from UP to DOWN', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'UP',
      };
      const newState = changeDirection(state, 'DOWN');
      expect(newState.direction).toBe('UP');
    });

    it('should not allow 180-degree turn from DOWN to UP', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'DOWN',
      };
      const newState = changeDirection(state, 'UP');
      expect(newState.direction).toBe('DOWN');
    });

    it('should not allow 180-degree turn from LEFT to RIGHT', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'LEFT',
      };
      const newState = changeDirection(state, 'RIGHT');
      expect(newState.direction).toBe('LEFT');
    });
  });
});
