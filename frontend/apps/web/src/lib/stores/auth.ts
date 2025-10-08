import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type User, type LoginRequest, type RegisterRequest } from '@health-platform/types'
import { services } from '@health-platform/api-client'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAuthToken: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,


      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await services.auth.login(credentials)
          
          // Store tokens in both Zustand state and localStorage
          set({ 
            user: response.user, 
            token: response.accessToken, 
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false 
          })
          
          // Also store in localStorage for API client
          if (typeof window !== 'undefined') {
            localStorage.setItem('health_platform_token', response.accessToken)
            localStorage.setItem('health_platform_refresh_token', response.refreshToken)
            localStorage.setItem('health_platform_user', JSON.stringify(response.user))
          }
        } catch (err) {
          const e = err as any
          let msg = 'Login failed'
          if (Array.isArray(e?.message)) {
            msg = e.message.join(', ')
          } else if (typeof e?.message === 'string') {
            msg = e.message
          }
          set({ error: msg, isLoading: false })
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await services.auth.register(data)
          
          // Store tokens in both Zustand state and localStorage
          set({ 
            user: response.user, 
            token: response.accessToken, 
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false 
          })
          
          // Also store in localStorage for API client
          if (typeof window !== 'undefined') {
            localStorage.setItem('health_platform_token', response.accessToken)
            localStorage.setItem('health_platform_refresh_token', response.refreshToken)
            localStorage.setItem('health_platform_user', JSON.stringify(response.user))
          }
        } catch (err) {
          const e = err as any
          let msg = 'Registration failed'
          if (Array.isArray(e?.message)) {
            msg = e.message.join(', ')
          } else if (typeof e?.message === 'string') {
            msg = e.message
          }
          set({ error: msg, isLoading: false })
        }
      },

      logout: async () => {
        try {
          // Call backend logout API to invalidate tokens
          await services.auth.logout()
        } catch (error) {
          // Even if API call fails, we should still clear local state
          console.warn('Logout API call failed:', error)
        } finally {
          // Always clear local state
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false,
            error: null 
          })
          
          // Clear localStorage as well
          if (typeof window !== 'undefined') {
            localStorage.removeItem('health_platform_token')
            localStorage.removeItem('health_platform_refresh_token')
            localStorage.removeItem('health_platform_user')
          }
        }
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return

        try {
          const response = await services.auth.refresh({ refreshToken })
          set({ token: response.accessToken, refreshToken: response.refreshToken })
        } catch (error) {
          // If refresh fails, logout user
          console.warn('Token refresh failed:', error)
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated 
      }),
      
    }
  )
)
