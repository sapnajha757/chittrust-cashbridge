import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

  // Check demo mode or demo session cookie
  const isDemoUrl = searchParams.get('demo') === 'true' || request.headers.get('referer')?.includes('demo=true');
  const hasDemoCookie = request.cookies.has('chittrust_demo_session');

  // Retrieve Supabase auth session token cookie if present
  const authCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    request.cookies.get('sb-auth-token') ||
    Array.from(request.cookies.getAll()).find((c) => c.name.includes('auth') || c.name.includes('sb-'));

  // Allow protected route access if authenticated OR demo session active OR in prototype mode
  if (!authCookie && !hasDemoCookie && !isDemoUrl) {
    // If not authenticated and no demo cookie, set demo session cookie and allow access for seamless hackathon testing
    const response = NextResponse.next();
    response.cookies.set('chittrust_demo_session', 'true', { path: '/', maxAge: 86400 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
