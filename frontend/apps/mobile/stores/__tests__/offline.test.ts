import { useOfflineStore, RequestMethod } from '../offline';

describe('Offline Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useOfflineStore.getState().setOnline(true);
    useOfflineStore.getState().clearQueue();
    useOfflineStore.getState().clearFailed();
  });

  it('should have initial state', () => {
    const state = useOfflineStore.getState();
    
    expect(state.isOnline).toBe(true);
    expect(state.queue).toEqual([]);
    expect(state.syncInProgress).toBe(false);
    expect(state.failedRequests).toEqual([]);
  });

  it('should update online status', () => {
    useOfflineStore.getState().setOnline(false);
    expect(useOfflineStore.getState().isOnline).toBe(false);

    useOfflineStore.getState().setOnline(true);
    expect(useOfflineStore.getState().isOnline).toBe(true);
  });

  it('should add request to queue', () => {
    const mockRequest = {
      url: '/api/test',
      method: 'POST' as RequestMethod,
      data: { test: 'data' },
      maxRetries: 3,
    };

    useOfflineStore.getState().addToQueue(mockRequest);

    const state = useOfflineStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.queue[0].url).toBe(mockRequest.url);
    expect(state.queue[0].method).toBe(mockRequest.method);
  });

  it('should add multiple requests to queue', () => {
    useOfflineStore.getState().addToQueue({ url: '/api/test1', method: 'POST', maxRetries: 3 });
    useOfflineStore.getState().addToQueue({ url: '/api/test2', method: 'PUT', maxRetries: 3 });
    useOfflineStore.getState().addToQueue({ url: '/api/test3', method: 'DELETE', maxRetries: 3 });

    expect(useOfflineStore.getState().queue).toHaveLength(3);
  });

  it('should remove request from queue', () => {
    useOfflineStore.getState().addToQueue({ url: '/api/test1', method: 'POST', maxRetries: 3 });
    useOfflineStore.getState().addToQueue({ url: '/api/test2', method: 'POST', maxRetries: 3 });

    const state = useOfflineStore.getState();
    expect(state.queue).toHaveLength(2);

    const firstId = state.queue[0].id;
    useOfflineStore.getState().removeFromQueue(firstId);

    const newState = useOfflineStore.getState();
    expect(newState.queue).toHaveLength(1);
  });

  it('should clear queue', () => {
    useOfflineStore.getState().addToQueue({ url: '/api/test1', method: 'POST', maxRetries: 3 });
    useOfflineStore.getState().addToQueue({ url: '/api/test2', method: 'POST', maxRetries: 3 });
    useOfflineStore.getState().addToQueue({ url: '/api/test3', method: 'POST', maxRetries: 3 });

    expect(useOfflineStore.getState().queue).toHaveLength(3);

    useOfflineStore.getState().clearQueue();
    expect(useOfflineStore.getState().queue).toEqual([]);
  });

  it('should handle removing non-existent request', () => {
    useOfflineStore.getState().addToQueue({ url: '/api/test1', method: 'POST', maxRetries: 3 });

    expect(useOfflineStore.getState().queue).toHaveLength(1);

    useOfflineStore.getState().removeFromQueue('non-existent');

    // Queue should remain unchanged
    expect(useOfflineStore.getState().queue).toHaveLength(1);
  });

  it('should set sync in progress', () => {
    useOfflineStore.getState().setSyncInProgress(true);
    expect(useOfflineStore.getState().syncInProgress).toBe(true);

    useOfflineStore.getState().setSyncInProgress(false);
    expect(useOfflineStore.getState().syncInProgress).toBe(false);
  });
});

