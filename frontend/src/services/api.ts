import { User, LeaderboardEntry, ActivePlayer, AuthCredentials, ApiResponse, GameMode } from '@/types/game';

const API_URL = 'http://localhost:8000';

// Helper for making API requests with auth token
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers as object,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle non-200 responses that might strictly be errors in a RESTful sense
    // but our backend seems to return success: false for some logic errors even with 200/201.
    // However, fastAPI might return 401/422 etc.
    if (!response.ok) {
      // Check if the response body has the standard error structure
      if (data && data.detail) {
        return { success: false, error: Array.isArray(data.detail) ? data.detail[0].msg : data.detail };
      }
      return { success: false, error: data.error || `Error ${response.status}: ${response.statusText}` };
    }

    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// API Service
export const api = {
  // Authentication
  async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    const response = await fetchApi<User & { token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && (response as any).token) {
      // The backend returns { success: true, data: User, token: string }
      // We need to type cast or handle the response structure difference if T is strict
      const { token } = response as any;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response;
  },

  async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    const response = await fetchApi<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Auto-login is not explicitly in the backend signup response (it just returns user data),
    // so the user might need to login manually or we fix the flow. 
    // The previous mock implementation did auto-login locally.
    // For now, let's stick to what the backend provides. 
    // If the backend doesn't provide a token on signup, we can't auto-login unless we trigger a login call.
    // Let's assume the user will need to log in, OR prompts the user.
    // But to match the previous seamless experience, we might want to call login immediately.
    // However, we don't have the password in plain text if we only have the credentials object passed in... 
    // Wait, we DO have it in `credentials`.

    if (response.success) {
      // Optionally auto-login
      return api.login({ email: credentials.email, password: credentials.password });
    }

    return response;
  },

  async logout(): Promise<ApiResponse<void>> {
    const response = await fetchApi<void>('/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    // If no token, don't bother fetching
    if (!localStorage.getItem('token')) {
      return { success: true, data: null };
    }

    const response = await fetchApi<User>('/auth/me');

    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    } else {
      // If fetch fails (likely 401), clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Return null user instead of error to match previous behavior of "not logged in"
      return { success: true, data: null };
    }

    return response;
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    const query = mode ? `?mode=${mode}` : '';
    return fetchApi<LeaderboardEntry[]>(`/leaderboard${query}`);
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    return fetchApi<LeaderboardEntry>('/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ score, mode }),
    });
  },

  // Active Players / Watching
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    return fetchApi<ActivePlayer[]>('/active-players');
  },

  async getActivePlayerById(id: string): Promise<ApiResponse<ActivePlayer | undefined>> {
    return fetchApi<ActivePlayer | undefined>(`/active-players/${id}`);
  },

  // Simulate player movement for watching
  // This logic is client-side simulation for the "watch" mode if the backend doesn't stream updates yet.
  // We can keep the previous logic or rely on repeated polling.
  // Since the backend `active-players` endpoints seem static in the spec (REST), 
  // real-time updates might need polling or websockets.
  // For now, I will KEEP the client-side simulation logic to ensure the "watch" feature doesn't break 
  // until we have a real streaming solution.
  simulatePlayerMovement(player: ActivePlayer, gridSize: number): ActivePlayer {
    const head = { ...player.snake[0] };
    const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

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
