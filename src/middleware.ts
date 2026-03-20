// src/middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  // Protected routes
  const protectedPaths = ['/dashboard', '/profile', '/settings']
  const isProtectedPath = protectedPaths.some(path => nextUrl.pathname.startsWith(path))

  // Auth routes (redirect if already logged in)
  const authPaths = ['/auth', '/signup']
  const isAuthPath = authPaths.some(path => nextUrl.pathname.startsWith(path))

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/auth', nextUrl.origin)
    loginUrl.searchParams.set('redirect', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to home if accessing auth routes while logged in
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth',
    '/signup',
  ],
}
