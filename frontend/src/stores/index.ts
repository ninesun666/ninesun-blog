import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

// Helper to get user from localStorage
const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('user')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

// 主题状态管理
type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') {
    return stored
  }
  // 默认跟随系统
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getStoredTheme(),
  toggleTheme: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newMode)
    document.documentElement.setAttribute('data-theme', newMode)
    set({ mode: newMode })
  },
  setTheme: (mode) => {
    localStorage.setItem('theme', mode)
    document.documentElement.setAttribute('data-theme', mode)
    set({ mode })
  },
}))
