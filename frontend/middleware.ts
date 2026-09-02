import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve Supabase auth session token cookie
  const authCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    request.cookies.get('sb-auth-token') ||
    Array.from(request.cookies.getAll()).find((c) => c.name.includes('auth') || c.name.includes('sb-'));

  const isAuthenticated = !!authCookie;

  // If authenticated user visits /login, redirect to /dashboard
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // List of public routes that do not require authentication
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/verify-otp') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/dev');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Enforce authentication for protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


