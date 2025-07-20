'use client'

import { useState } from 'react'
import { useSupabase, useSupabaseQuery } from '@/hooks/use-supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export function SupabaseExample() {
  const { user, session, loading: authLoading, supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Contoh query data dari tabel 'users'
  const { data: users, loading: usersLoading, error: usersError } = useSupabaseQuery<User>('users', {
    select: 'id, name, email, created_at',
    orderBy: { column: 'created_at', ascending: false },
    limit: 5
  })

  const handleSignUp = async () => {
    if (!supabase) {
      console.error('Supabase client not configured')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) {
      console.error('Error signing up:', error.message)
    } else {
      console.log('Sign up successful!')
    }
  }

  const handleSignIn = async () => {
    if (!supabase) {
      console.error('Supabase client not configured')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error signing in:', error.message)
    } else {
      console.log('Sign in successful!')
    }
  }

  const handleSignOut = async () => {
    if (!supabase) {
      console.error('Supabase client not configured')
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!session ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSignUp}>Sign Up</Button>
                <Button onClick={handleSignIn} variant="outline">
                  Sign In
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Welcome, {user?.user_metadata?.name || user?.email}!</p>
              <Button onClick={handleSignOut} color="destructive">
                Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users Data (from Supabase)</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <p>Loading users...</p>
          ) : usersError ? (
            <p className="text-red-500">Error: {usersError}</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="p-3 border rounded">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 