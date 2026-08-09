// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'  // ✅ Fixed: added 'from'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip static assets
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') ||
    path.startsWith('/images') ||
    path.startsWith('/fonts')
  ) {
    return NextResponse.next()
  }

  console.log('🔐 [Proxy] Path:', path)

  // Check for Supabase session cookies
  const hasSession = 
    request.cookies.has('sb-access-token') || 
    request.cookies.has('sb-refresh-token') ||
    request.cookies.has('supabase-auth-token')

  console.log('🔐 [Proxy] Has session:', hasSession)

  // ONLY handle portal page redirect
  if (path === '/portal') {
    if (hasSession) {
      console.log('🚀 [Proxy] Session found, redirecting to admin')
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    console.log('👤 [Proxy] No session, showing portal')
    return NextResponse.next()
  }

  // ✅ IMPORTANT: Allow admin pages to load without redirect
  if (path.startsWith('/admin')) {
    console.log('✅ [Proxy] Admin page requested, allowing access')
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}