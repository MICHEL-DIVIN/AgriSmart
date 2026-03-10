"use client"
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace('/login')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return <AppLayout>{children}</AppLayout>
}
