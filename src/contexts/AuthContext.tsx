"use client"
import { createContext, useContext, 
  useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  userRole: string | null
  loading: boolean
  signIn: (email: string, password: string) 
    => Promise<{ error: any }>
  signUp: (email: string, password: string, 
    metadata?: object) 
    => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
})

export function AuthProvider({ 
  children 
}: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const loadUser = async () => {
      const { data: { session } } = 
        await supabase.auth.getSession()
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setUserRole(data?.role ?? 'user')
      }
      
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = 
      supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
          if (!session) {
            setUserRole(null)
            setLoading(false)
          }
        }
      )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (
    email: string, 
    password: string
  ) => {
    const supabase = createClient()
    const { data, error } = await 
      supabase.auth.signInWithPassword({ 
        email, password 
      })
    
    if (error) return { error }
    
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      const role = profile?.role ?? 'user'
      setUserRole(role)
      
      if (role === 'admin') {
        window.location.replace('/admin')
      } else {
        window.location.replace('/')
      }
    }
    
    return { error: null }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata: any = {}
  ) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: metadata }
    })
    return { error }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    window.location.replace('/login')
  }

  const signInWithGoogle = async () => {
    const supabase = createClient()
    const { error } = await 
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user, userRole, loading,
      signIn, signUp, signOut, signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
