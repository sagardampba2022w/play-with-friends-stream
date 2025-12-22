import { describe, it, expect, beforeEach } from 'vitest';
import { api } from './api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
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
    });
  });
});
