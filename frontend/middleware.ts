import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Retrieve Supabase auth session token cookie or demo session cookie
  const isDemoUrl = searchParams.get('demo') === 'true' || request.headers.get('referer')?.includes('demo=true');
  const hasDemoCookie = request.cookies.has('chittrust_demo_session');
  const authCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    request.cookies.get('sb-auth-token') ||
    Array.from(request.cookies.getAll()).find((c) => c.name.includes('auth') || c.name.includes('sb-'));

  const isAuthenticated = !!(authCookie || hasDemoCookie || isDemoUrl);

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

  // Allow protected route access; set demo cookie if not authenticated
  const response = NextResponse.next();
  if (!isAuthenticated) {
    response.cookies.set('chittrust_demo_session', 'true', { path: '/', maxAge: 86400 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

