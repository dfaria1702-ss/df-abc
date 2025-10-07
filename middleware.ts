import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple access level determination from headers
function getAccessLevelFromRequest(
  request: NextRequest
): 'none' | 'limited' | 'full' {
  // DEVELOPMENT: Temporarily allow access to Kubernetes and Playground routes without authentication
  if (request.nextUrl.pathname.startsWith('/kubernetes') || 
      request.nextUrl.pathname.startsWith('/playground')) {
    return 'full';
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken) {
    return 'none';
  }

  // For demo purposes, if we have an auth token, grant full access
  return 'full';
}

// Route access configuration
const routeConfigs = {
  none: ['/auth', '/auth/signin', '/auth/signup'],
  limited: [
    '/dashboard',
    '/docs',
    '/documentation',
    '/cost-estimator',
    '/ai-studio',
    '/profile',
    '/support',
    '/settings/profile',
    '/dashboard/profile-completion',
    '/playground',
    '/model-hub',
  ],
  full: ['*'], // Wildcard for full access
};

function checkRouteAccess(
  pathname: string,
  accessLevel: 'none' | 'limited' | 'full'
): boolean {
  const allowedRoutes = routeConfigs[accessLevel];

  // Full access allows everything
  if (allowedRoutes.includes('*')) {
    return true;
  }

  // Check exact match
  if (allowedRoutes.includes(pathname)) {
    return true;
  }

  // Check prefix match (for nested routes)
  return allowedRoutes.some(route => {
    const normalizedRoute = route.replace(/\/$/, '');
    const normalizedPath = pathname.replace(/\/$/, '');
    return normalizedPath.startsWith(normalizedRoute);
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Get access level from request
  const accessLevel = getAccessLevelFromRequest(request);

  // DEBUG: Log playground route access (will appear in Vercel logs)
  if (pathname.startsWith('/playground')) {
    console.log('[Middleware] Playground access:', { pathname, accessLevel, hasToken: !!request.cookies.get('auth-token') });
  }

  // Check if user has access to the requested route
  const hasAccess = checkRouteAccess(pathname, accessLevel);

  if (!hasAccess) {
    // DEBUG: Log blocked access
    if (pathname.startsWith('/playground')) {
      console.log('[Middleware] BLOCKED playground access:', { pathname, accessLevel });
    }
    // If no access, redirect to sign in page
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  // Exception: Allow access to profile completion flows
  if (accessLevel !== 'none' && pathname.startsWith('/auth')) {
    const allowedAuthRoutes = ['/auth/profile-completion'];

    const isAllowedAuthRoute = allowedAuthRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (!isAllowedAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Clone the request headers and add the auth token
  const requestHeaders = new Headers(request.headers);
  if (accessLevel !== 'none') {
    requestHeaders.set(
      'x-auth-token',
      request.cookies.get('auth-token')?.value || ''
    );
  }

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
