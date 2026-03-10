import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { pathname } = request.nextUrl
  
  const isAuthRoute = pathname.startsWith('/login') 
    || pathname.startsWith('/register')
  const isAdminRoute = pathname.startsWith('/admin')

  // Non connecté → login
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  // Connecté + route auth → redirect (géré côté client)
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.redirect(
        new URL('/admin', request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/', request.url)
    )
  }

  // Route admin → vérifier rôle
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(
        new URL('/', request.url)
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
