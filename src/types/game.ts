export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'pass-through' | 'walls';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
  rank: number;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  snake: Position[];
  food: Position;
  direction: Direction;
  status: GameStatus;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
