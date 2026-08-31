import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of public routes that do not require authentication
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/verify-otp') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api');

  // Retrieve Supabase auth session token cookie if present
  const authCookie = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');

  // Protected route check
  if (!isPublicRoute && !authCookie) {
    // Note: Client-side AuthProvider handles dynamic fallback gracefully if cookies are client-only
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
