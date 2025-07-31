'use client'

import { useState, useEffect } from 'react'
import { useSupabase, useSupabaseQuery } from '@/hooks/use-supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'

interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  website?: string
  bio?: string
  created_at: string
  updated_at: string
}

interface Post {
  id: string
  title: string
  content: string
  author_id: string
  published: boolean
  created_at: string
  updated_at: string
}

export function SupabaseDashboard() {
  const { user, session, loading: authLoading, supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  // Form untuk posts
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  // Query data dari semua tabel
  const { data: users, loading: usersLoading, error: usersError } = useSupabaseQuery<User>('users', {
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  })

  const { data: profiles, loading: profilesLoading, error: profilesError } = useSupabaseQuery<Profile>('profiles', {
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  })

  const { data: posts, loading: postsLoading, error: postsError } = useSupabaseQuery<Post>('posts', {
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  })

  const handleSignUp = async () => {
    if (!supabase) {
      toast({
        title: "Configuration Error",
        description: "Supabase client tidak terkonfigurasi",
        variant: "destructive",
        duration: 3000,
      })
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
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } else {
      console.log('Sign up successful!')
      toast({
        title: "Sign Up Successful!",
        description: "Periksa email Anda untuk konfirmasi akun",
        duration: 5000,
      })
    }
  }

  const handleSignIn = async () => {
    if (!supabase) {
      toast({
        title: "Configuration Error",
        description: "Supabase client tidak terkonfigurasi",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error signing in:', error.message)
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } else {
      console.log('Sign in successful!')
      toast({
        title: "Sign In Successful!",
        description: "Berhasil masuk ke akun Anda",
        duration: 3000,
      })
    }
  }

  const handleSignOut = async () => {
    if (!supabase) {
      toast({
        title: "Configuration Error",
        description: "Supabase client tidak terkonfigurasi",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } else {
      toast({
        title: "Signed Out",
        description: "Berhasil keluar dari akun",
        duration: 3000,
      })
    }
  }

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Silakan masuk untuk membuat post",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!supabase) {
      toast({
        title: "Configuration Error",
        description: "Supabase client tidak terkonfigurasi",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title: postTitle,
          content: postContent,
          author_id: user.id,
          published: isPublished
        }
      ])

    if (error) {
      console.error('Error creating post:', error.message)
      toast({
        title: "Create Post Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      })
    } else {
      console.log('Post created successfully!')
      toast({
        title: "Post Created!",
        description: "Post berhasil dibuat",
        duration: 3000,
      })
      setPostTitle('')
      setPostContent('')
      setIsPublished(false)
      // Refresh posts data
      window.location.reload()
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Supabase Dashboard</h1>
          <p className="text-gray-600">Complete CRUD operations with Supabase</p>
        </div>

        {/* Authentication Section */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            {!session ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Welcome, {user?.user_metadata?.name || user?.email}!
                    </p>
                    <p className="text-sm text-gray-500">User ID: {user?.id}</p>
                  </div>
                  <Button onClick={handleSignOut} color="destructive">
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Post Section */}
        {session && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postTitle">Title</Label>
                <Input
                  id="postTitle"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postContent">Content</Label>
                <Textarea
                  id="postContent"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Enter post content"
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <Label htmlFor="isPublished">Publish immediately</Label>
              </div>
              <Button onClick={handleCreatePost} disabled={!postTitle || !postContent}>
                Create Post
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Data Display Section */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users ({users?.length || 0})</TabsTrigger>
            <TabsTrigger value="profiles">Profiles ({profiles?.length || 0})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users Data</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : usersError ? (
                  <p className="text-red-500">Error: {usersError}</p>
                ) : (
                  <div className="space-y-4">
                    {users?.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {user.avatar_url && (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profiles Data</CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <p>Loading profiles...</p>
                ) : profilesError ? (
                  <p className="text-red-500">Error: {profilesError}</p>
                ) : (
                  <div className="space-y-4">
                    {profiles?.map((profile) => (
                      <div key={profile.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{profile.full_name}</h3>
                            {profile.website && (
                              <p className="text-sm text-blue-600">
                                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                  {profile.website}
                                </a>
                              </p>
                            )}
                            {profile.bio && (
                              <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Created: {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {profile.avatar_url && (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Posts Data</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <p>Loading posts...</p>
                ) : postsError ? (
                  <p className="text-red-500">Error: {postsError}</p>
                ) : (
                  <div className="space-y-4">
                    {posts?.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{post.title}</h3>
                              <Badge color={post.published ? "success" : "secondary"}>
                                {post.published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                            <p className="text-xs text-gray-500">
                              Author ID: {post.author_id} | 
                              Created: {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 