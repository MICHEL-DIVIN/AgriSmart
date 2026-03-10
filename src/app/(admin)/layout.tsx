"use client"
import AdminLayout from '@/components/admin/AdminLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminLayout_({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      window.location.replace('/login')
      return
    }
    if (userRole && userRole !== 'admin') {
      window.location.replace('/')
    }
  }, [user, userRole, loading])

  if (loading || !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || userRole !== 'admin') return null

  return <AdminLayout>{children}</AdminLayout>
}
