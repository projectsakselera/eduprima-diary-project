'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type UserRole = 'super_admin' | 'database_tutor_manager'

export interface User {
  id: string
  email: string
  user_code: string
  role: UserRole
  primary_role: string
  account_type: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
  hasAccess: (path: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const hasAccess = (path: string): boolean => {
    if (!user) return false
    
    // Super admin has access to everything
    if (user.role === 'super_admin') return true
    
    // Database tutor manager only has access to database-tutor paths
    if (user.role === 'database_tutor_manager') {
      return path.includes('/eduprima/main/ops/em/matchmaking/database-tutor')
    }
    
    return false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 