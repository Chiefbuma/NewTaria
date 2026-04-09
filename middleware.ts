import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

const protectedPrefixes = ['/dashboard', '/api'];
const authPages = ['/', '/register'];
const passwordChangeExemptPaths = [
  '/change-password',
  '/forgot-password',
  '/reset-password',
  '/api/auth/session',
  '/api/auth/change-password',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionCookie);
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isSessionProtectedPage = pathname === '/change-password';
  const isAuthPage = authPages.includes(pathname);
  const isPasswordChangeExempt = passwordChangeExemptPaths.some((prefix) => pathname.startsWith(prefix));

  if ((isProtectedRoute || isSessionProtectedPage) && !session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session?.mustChangePassword && !isPasswordChangeExempt) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Password change required' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/change-password', request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
