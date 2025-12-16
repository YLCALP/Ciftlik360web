import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { setSecurityHeaders } from '@/lib/middleware-security';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Early return for static files and assets - no auth check needed
    const isStaticFile =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/);

    if (isStaticFile) {
        return NextResponse.next();
    }

    // Early return for public auth pages - minimal processing
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    let user = null;

    try {
        // PERFORMANCE OPTIMIZATION:
        // Use getSession() instead of getUser() for middleware routing.
        // getUser() sends a request to the Auth server every time (safe but slow: ~200-500ms).
        // getSession() only validates the JWT locally (instant).
        // Actual data security is handled by RLS on the server side.
        const {
            data: { session },
        } = await supabase.auth.getSession();
        user = session?.user || null;
    } catch (error) {
        // Handle refresh token errors gracefully
        console.error('Auth error in proxy:', error);
        // Clear any invalid session cookies
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
    }

    // Redirect logged in users away from auth pages
    if (user && isAuthPage) {
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        return setSecurityHeaders(redirectResponse);
    }

    // Protected routes - redirect to login if not authenticated
    if (!user && !isAuthPage) {
        const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
        return setSecurityHeaders(loginRedirect);
    }

    // Lightweight session activity update - only update cookie, no heavy checks
    if (user) {
        // Simple timestamp update without heavy session validation
        response.cookies.set('last-activity', Date.now().toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600, // 1 hour
            path: '/',
        });
    }

    // Apply security headers to all responses
    return setSecurityHeaders(response);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - API routes
         * - Static files (_next/static, _next/image)
         * - Public files (favicon, images, etc.)
         * - File extensions (svg, png, jpg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
    ],
};
