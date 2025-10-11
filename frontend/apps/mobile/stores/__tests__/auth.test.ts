import { useAuthStore } from '../auth';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test by calling logout directly
    useAuthStore.getState().logout();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set user and tokens on login', () => {
    const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };
    const mockAccessToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';

    useAuthStore.getState().setAuth(mockUser as any, mockAccessToken, mockRefreshToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockAccessToken);
    expect(state.refreshToken).toBe(mockRefreshToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear state on logout', () => {
    // Set up authenticated state
    const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };
    useAuthStore.getState().setAuth(mockUser as any, 'token', 'refresh-token');

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update tokens', () => {
    useAuthStore.getState().setTokens('initial-access', 'initial-refresh');
    
    let state = useAuthStore.getState();
    expect(state.accessToken).toBe('initial-access');
    expect(state.refreshToken).toBe('initial-refresh');

    useAuthStore.getState().setTokens('new-access', 'new-refresh');
    
    state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('should set and clear errors', () => {
    useAuthStore.getState().setError('Test error');
    expect(useAuthStore.getState().error).toBe('Test error');

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});

