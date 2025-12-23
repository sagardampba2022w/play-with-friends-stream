import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api';

// Track registered users for mock
const mockUsers = new Map<string, { email: string; username: string; password: string; id: string }>();

// Initialize with existing test user
mockUsers.set('player1@test.com', {
  id: 'user-1',
  email: 'player1@test.com',
  username: 'NeonViper',
  password: 'password123'
});

// Mock fetch globally to prevent actual network calls
global.fetch = vi.fn((url: string, options?: RequestInit) => {
  const endpoint = (url as string).replace('/api', '');
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : null;

  // Authentication endpoints
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = mockUsers.get(body.email);
    if (user && user.password === body.password) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { id: user.id, email: user.email, username: user.username },
          token: 'mock-token-123'
        })
      });
    }
    if (user) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Invalid password' })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'User not found' })
    });
  }

  if (endpoint === '/auth/signup' && method === 'POST') {
    if (mockUsers.has(body.email)) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Email already registered' })
      });
    }
    if (!body.username) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Username is required' })
      });
    }
    // Add new user to mock database
    const newUser = {
      id: `user-${Date.now()}`,
      email: body.email,
      username: body.username,
      password: body.password
    };
    mockUsers.set(body.email, newUser);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { id: newUser.id, email: newUser.email, username: newUser.username }
      })
    });
  }

  if (endpoint === '/auth/logout' && method === 'POST') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  }

  if (endpoint === '/auth/me') {
    const authHeader = (options?.headers as any)?.['Authorization'];
    if (authHeader) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { id: 'user-1', email: 'player1@test.com', username: 'NeonViper' }
        })
      });
    }
    return Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Unauthorized' })
    });
  }

  // Leaderboard endpoints
  if (endpoint.startsWith('/leaderboard')) {
    if (method === 'POST') {
      const authHeader = (options?.headers as any)?.['Authorization'];
      if (!authHeader) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: false, error: 'Must be logged in to submit score' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'entry-1',
            username: 'NeonViper',
            score: body.score,
            mode: body.mode,
            timestamp: new Date().toISOString()
          }
        })
      });
    }

    // GET leaderboard
    const mockLeaderboard = [
      { id: 'entry-1', username: 'Player1', score: 500, mode: 'walls', timestamp: '2025-01-01T00:00:00Z' },
      { id: 'entry-2', username: 'Player2', score: 300, mode: 'pass-through', timestamp: '2025-01-01T00:00:00Z' },
      { id: 'entry-3', username: 'Player3', score: 450, mode: 'walls', timestamp: '2025-01-01T00:00:00Z' }
    ];

    const hasMode = endpoint.includes('?mode=');
    const mode = hasMode ? endpoint.split('?mode=')[1] : null;
    const filtered = mode ? mockLeaderboard.filter(e => e.mode === mode) : mockLeaderboard;

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: filtered })
    });
  }

  // Active players endpoints
  if (endpoint.startsWith('/active-players')) {
    if (endpoint === '/active-players') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            {
              id: 'active-1',
              username: 'LivePlayer42',
              score: 100,
              mode: 'walls',
              snake: [{ x: 10, y: 10 }],
              food: { x: 15, y: 15 },
              direction: 'RIGHT',
              status: 'playing'
            }
          ]
        })
      });
    }

    const playerId = endpoint.split('/active-players/')[1];
    if (playerId === 'active-1') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'active-1',
            username: 'LivePlayer42',
            score: 100,
            mode: 'walls',
            snake: [{ x: 10, y: 10 }],
            food: { x: 15, y: 15 },
            direction: 'RIGHT',
            status: 'playing'
          }
        })
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: undefined })
    });
  }

  // Default fallback
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ detail: 'Not found' })
  });
}) as any;

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset mock users to initial state
    mockUsers.clear();
    mockUsers.set('player1@test.com', {
      id: 'user-1',
      email: 'player1@test.com',
      username: 'NeonViper',
      password: 'password123'
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const result = await api.login({
        email: 'player1@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('NeonViper');
    });

    it('should fail login with invalid password', async () => {
      const result = await api.login({
        email: 'player1@test.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
    });

    it('should fail login with non-existent user', async () => {
      const result = await api.login({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should signup with valid credentials', async () => {
      const result = await api.signup({
        email: 'newuser@test.com',
        password: 'newpassword123',
        username: 'NewPlayer',
      });

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('NewPlayer');
      expect(result.data?.email).toBe('newuser@test.com');
    });

    it('should fail signup with existing email', async () => {
      const result = await api.signup({
        email: 'player1@test.com',
        password: 'password123',
        username: 'AnotherPlayer',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('should fail signup without username', async () => {
      const result = await api.signup({
        email: 'newuser2@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('should logout successfully', async () => {
      await api.login({
        email: 'player1@test.com',
        password: 'password123',
      });

      const result = await api.logout();
      expect(result.success).toBe(true);

      const currentUser = await api.getCurrentUser();
      expect(currentUser.data).toBeNull();
    });

    it('should persist user in localStorage after login', async () => {
      await api.login({
        email: 'player1@test.com',
        password: 'password123',
      });

      const stored = localStorage.getItem('user');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.username).toBe('NeonViper');
    });
  });

  describe('Leaderboard', () => {
    it('should get leaderboard', async () => {
      const result = await api.getLeaderboard();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('should filter leaderboard by mode', async () => {
      const result = await api.getLeaderboard('walls');

      expect(result.success).toBe(true);
      expect(result.data!.every(entry => entry.mode === 'walls')).toBe(true);
    });

    it('should submit score when logged in', async () => {
      await api.login({
        email: 'player1@test.com',
        password: 'password123',
      });

      const result = await api.submitScore(500, 'walls');

      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(500);
      expect(result.data?.username).toBe('NeonViper');
    });

    it('should fail to submit score when not logged in', async () => {
      await api.logout();

      const result = await api.submitScore(500, 'walls');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be logged in to submit score');
    });
  });

  describe('Active Players', () => {
    it('should get active players', async () => {
      const result = await api.getActivePlayers();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('should get active player by id', async () => {
      const result = await api.getActivePlayerById('active-1');

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('LivePlayer42');
    });

    it('should return undefined for non-existent player', async () => {
      const result = await api.getActivePlayerById('non-existent');

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe('Player Movement Simulation', () => {
    it('should simulate player movement', () => {
      const player = {
        id: 'test-1',
        username: 'TestPlayer',
        score: 0,
        mode: 'walls' as const,
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
        food: { x: 15, y: 10 },
        direction: 'RIGHT' as const,
        status: 'playing' as const,
      };

      const result = api.simulatePlayerMovement({ ...player }, 20);

      // Snake should have moved
      expect(result.snake[0]).not.toEqual(player.snake[0]);
    });

    it('should wrap snake in pass-through mode', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5); // Prevent random direction change

      const player = {
        id: 'test-1',
        username: 'TestPlayer',
        score: 0,
        mode: 'pass-through' as const,
        snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }],
        food: { x: 15, y: 10 },
        direction: 'LEFT' as const,
        status: 'playing' as const,
      };

      const result = api.simulatePlayerMovement({ ...player }, 20);

      expect(result.snake[0].x).toBe(19);
      expect(result.status).toBe('playing');

      randomSpy.mockRestore();
    });
  });
});
