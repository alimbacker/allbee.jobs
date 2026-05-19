import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_SEEKER = ['/seeker']
const PROTECTED_EMPLOYER = ['/employer']
const PROTECTED_ADMIN = ['/admin']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  // Redirect unauthenticated users
  if (!session) {
    const isProtected = [
      ...PROTECTED_SEEKER,
      ...PROTECTED_EMPLOYER,
      ...PROTECTED_ADMIN,
    ].some((p) => path.startsWith(p))

    if (isProtected) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Role-based access for admin routes
  if (session && path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/seeker/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/seeker/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
