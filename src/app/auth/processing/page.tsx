"use client"
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProcessingPage() {
  const { user, userRole, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      window.location.replace('/login')
      return
    }
    
    if (userRole === 'admin') {
      window.location.replace('/admin')
    } else {
      window.location.replace('/')
    }
  }, [user, userRole, loading])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4 text-white">
          Connexion en cours...
        </p>
      </div>
    </div>
  )
}
