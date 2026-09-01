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
    pathname.startsWith('/api') ||
    pathname.startsWith('/dev');

  // Check demo mode or demo session cookie
  const isDemo = searchParams.get('demo') === 'true';
  const hasDemoCookie = request.cookies.get('chittrust_demo_session')?.value === 'true';

  // Retrieve Supabase auth session token cookie if present
  const authCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    request.cookies.get('sb-auth-token') ||
    Array.from(request.cookies.getAll()).find((c) => c.name.includes('auth-token') || c.name.includes('sb-'));

  // Allow protected route access if authenticated OR demo session active
  if (!isPublicRoute && !authCookie && !isDemo && !hasDemoCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
