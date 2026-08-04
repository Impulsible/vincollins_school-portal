/* eslint-disable @typescript-eslint/no-unused-vars */
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/portal',
    '/login',
    '/signup',
    '/about',
    '/contact',
    '/admissions',
    '/programs',
    '/gallery',
    '/news',
    '/careers',
    '/api/auth',
  ]

  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(`${p}/`))

  // Protect dashboard routes
  if (path.startsWith('/dashboard') && !user) {
    const redirectUrl = new URL('/portal', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Protect admin routes
  if (path.startsWith('/admin') && !user) {
    const redirectUrl = new URL('/portal', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if already logged in and trying to access portal
  if (path.startsWith('/portal') && user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Redirect admin to admin dashboard
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    // Redirect regular users to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For API routes, just pass through
  if (path.startsWith('/api')) {
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - fonts (public fonts)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}
