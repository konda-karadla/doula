import { create } from 'zustand';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface QueuedRequest {
  id: string;
  method: RequestMethod;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  // State
  isOnline: boolean;
  queue: QueuedRequest[];
  syncInProgress: boolean;
  lastSyncAt: number | null;
  failedRequests: QueuedRequest[];

  // Actions
  setOnline: (isOnline: boolean) => void;
  addToQueue: (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setSyncInProgress: (inProgress: boolean) => void;
  incrementRetry: (id: string) => void;
  moveToFailed: (request: QueuedRequest) => void;
  clearFailed: () => void;
  retryFailed: () => void;
  setLastSync: (timestamp: number) => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  // Initial state
  isOnline: true,
  queue: [],
  syncInProgress: false,
  lastSyncAt: null,
  failedRequests: [],

  // Actions
  setOnline: (isOnline) =>
    set({
      isOnline,
    }),

  addToQueue: (request) =>
    set((state) => ({
      queue: [
        ...state.queue,
        {
          ...request,
          id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: request.maxRetries ?? 3,
        },
      ],
    })),

  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((req) => req.id !== id),
    })),

  clearQueue: () =>
    set({
      queue: [],
    }),

  setSyncInProgress: (syncInProgress) =>
    set({
      syncInProgress,
    }),

  incrementRetry: (id) =>
    set((state) => ({
      queue: state.queue.map((req) =>
        req.id === id ? { ...req, retryCount: req.retryCount + 1 } : req
      ),
    })),

  moveToFailed: (request) =>
    set((state) => ({
      failedRequests: [...state.failedRequests, request],
      queue: state.queue.filter((req) => req.id !== request.id),
    })),

  clearFailed: () =>
    set({
      failedRequests: [],
    }),

  retryFailed: () =>
    set((state) => ({
      queue: [
        ...state.queue,
        ...state.failedRequests.map((req) => ({
          ...req,
          retryCount: 0,
          timestamp: Date.now(),
        })),
      ],
      failedRequests: [],
    })),

  setLastSync: (lastSyncAt) =>
    set({
      lastSyncAt,
    }),
}));

