import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { config } from '@health-platform/config'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  system: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user, token, refreshToken) => {
        // Store tokens in both Zustand and localStorage for API client compatibility
        if (typeof window !== 'undefined') {
          localStorage.setItem(config.appConfig.auth.tokenStorageKey, token)
          localStorage.setItem(config.appConfig.auth.refreshTokenStorageKey, refreshToken)
          localStorage.setItem(config.appConfig.auth.userStorageKey, JSON.stringify(user))
        }
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },
      
      logout: () => {
        // Clear tokens from both Zustand and localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(config.appConfig.auth.tokenStorageKey)
          localStorage.removeItem(config.appConfig.auth.refreshTokenStorageKey)
          localStorage.removeItem(config.appConfig.auth.userStorageKey)
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading })
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          // Update localStorage as well
          if (typeof window !== 'undefined') {
            localStorage.setItem(config.appConfig.auth.userStorageKey, JSON.stringify(updatedUser))
          }
          set({
            user: updatedUser
          })
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
