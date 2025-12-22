import { User, LeaderboardEntry, ActivePlayer, AuthCredentials, ApiResponse, GameMode, Position, Direction, GameStatus } from '@/types/game';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let currentUser: User | null = null;
let users: Map<string, User & { password: string }> = new Map();

// Initialize with some mock users
users.set('player1@test.com', {
  id: '1',
  username: 'NeonViper',
  email: 'player1@test.com',
  password: 'password123',
  highScore: 1250,
  createdAt: '2024-01-15T10:00:00Z'
});

users.set('player2@test.com', {
  id: '2',
  username: 'CyberSnake',
  email: 'player2@test.com',
  password: 'password123',
  highScore: 980,
  createdAt: '2024-02-20T14:30:00Z'
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'NeonViper', score: 1250, mode: 'walls', date: '2024-12-20T15:30:00Z', rank: 1 },
  { id: '2', username: 'PixelMaster', score: 1180, mode: 'walls', date: '2024-12-19T12:00:00Z', rank: 2 },
  { id: '3', username: 'RetroGamer', score: 1050, mode: 'pass-through', date: '2024-12-21T09:15:00Z', rank: 3 },
  { id: '4', username: 'CyberSnake', score: 980, mode: 'walls', date: '2024-12-18T18:45:00Z', rank: 4 },
  { id: '5', username: 'ArcadeKing', score: 920, mode: 'pass-through', date: '2024-12-20T22:00:00Z', rank: 5 },
  { id: '6', username: 'GlitchHunter', score: 850, mode: 'walls', date: '2024-12-17T11:30:00Z', rank: 6 },
  { id: '7', username: 'ByteRunner', score: 780, mode: 'pass-through', date: '2024-12-16T16:20:00Z', rank: 7 },
  { id: '8', username: 'CodeNinja', score: 720, mode: 'walls', date: '2024-12-15T20:10:00Z', rank: 8 },
  { id: '9', username: 'DataDragon', score: 650, mode: 'pass-through', date: '2024-12-14T14:00:00Z', rank: 9 },
  { id: '10', username: 'SynthWave', score: 580, mode: 'walls', date: '2024-12-13T08:45:00Z', rank: 10 },
];

// Mock active players for watching
const mockActivePlayers: ActivePlayer[] = [
  {
    id: 'active-1',
    username: 'LivePlayer42',
    score: 340,
    mode: 'walls',
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 12 },
    direction: 'RIGHT',
    status: 'playing'
  },
  {
    id: 'active-2',
    username: 'StreamSnake',
    score: 520,
    mode: 'pass-through',
    snake: [{ x: 5, y: 8 }, { x: 5, y: 9 }, { x: 5, y: 10 }, { x: 5, y: 11 }],
    food: { x: 12, y: 5 },
    direction: 'UP',
    status: 'playing'
  },
  {
    id: 'active-3',
    username: 'ProGamer99',
    score: 890,
    mode: 'walls',
    snake: [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }, { x: 11, y: 15 }],
    food: { x: 3, y: 7 },
    direction: 'RIGHT',
    status: 'playing'
  },
];

// API Service
export const api = {
  // Authentication
  async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    await delay(500);
    
    const user = users.get(credentials.email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    if (user.password !== credentials.password) {
      return { success: false, error: 'Invalid password' };
    }
    
    const { password, ...userData } = user;
    currentUser = userData;
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { success: true, data: userData };
  },

  async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    await delay(500);
    
    if (users.has(credentials.email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    if (!credentials.username) {
      return { success: false, error: 'Username is required' };
    }
    
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      highScore: 0,
      createdAt: new Date().toISOString()
    };
    
    users.set(credentials.email, newUser);
    
    const { password, ...userData } = newUser;
    currentUser = userData;
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { success: true, data: userData };
  },

  async logout(): Promise<ApiResponse<void>> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('user');
    return { success: true };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(100);
    
    if (currentUser) {
      return { success: true, data: currentUser };
    }
    
    const stored = localStorage.getItem('user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return { success: true, data: currentUser };
    }
    
    return { success: true, data: null };
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return { success: true, data: entries };
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    await delay(400);
    
    if (!currentUser) {
      return { success: false, error: 'Must be logged in to submit score' };
    }
    
    const entry: LeaderboardEntry = {
      id: `score-${Date.now()}`,
      username: currentUser.username,
      score,
      mode,
      date: new Date().toISOString(),
      rank: 0
    };
    
    // Update high score if applicable
    if (score > currentUser.highScore) {
      currentUser.highScore = score;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    mockLeaderboard.push(entry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    mockLeaderboard.forEach((e, i) => e.rank = i + 1);
    
    return { success: true, data: entry };
  },

  // Active Players / Watching
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    await delay(200);
    return { success: true, data: [...mockActivePlayers] };
  },

  async getActivePlayerById(id: string): Promise<ApiResponse<ActivePlayer | undefined>> {
    await delay(100);
    const player = mockActivePlayers.find(p => p.id === id);
    return { success: true, data: player };
  },

  // Simulate player movement for watching
  simulatePlayerMovement(player: ActivePlayer, gridSize: number): ActivePlayer {
    const head = { ...player.snake[0] };
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    
    // Sometimes change direction
    if (Math.random() < 0.2) {
      const validDirections = directions.filter(d => {
        if (player.direction === 'UP' && d === 'DOWN') return false;
        if (player.direction === 'DOWN' && d === 'UP') return false;
        if (player.direction === 'LEFT' && d === 'RIGHT') return false;
        if (player.direction === 'RIGHT' && d === 'LEFT') return false;
        return true;
      });
      player.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
    }
    
    // Move head
    switch (player.direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }
    
    // Handle wrapping for pass-through mode
    if (player.mode === 'pass-through') {
      if (head.x < 0) head.x = gridSize - 1;
      if (head.x >= gridSize) head.x = 0;
      if (head.y < 0) head.y = gridSize - 1;
      if (head.y >= gridSize) head.y = 0;
    }
    
    // Check if food eaten
    const ateFood = head.x === player.food.x && head.y === player.food.y;
    
    const newSnake = [head, ...player.snake];
    if (!ateFood) {
      newSnake.pop();
    } else {
      player.score += 10;
      player.food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    }
    
    // Check for collision in walls mode
    if (player.mode === 'walls') {
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        player.status = 'game-over';
      }
    }
    
    player.snake = newSnake;
    return player;
  }
};

export default api;
