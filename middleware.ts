import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { setSecurityHeaders } from '@/lib/middleware-security';
import { checkSessionExpiry } from '@/lib/session';

export async function middleware(request: NextRequest) {
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

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Check session expiry for authenticated users
    if (user) {
        const isSessionValid = await checkSessionExpiry();
        if (!isSessionValid) {
            // Session expired, redirect to login
            await supabase.auth.signOut();
            const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
            return setSecurityHeaders(loginRedirect);
        }
    }

    // Protected routes
    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
        // Allow access to public assets, api, etc.
        // Simple check: if it's not auth pages and not static files, redirect.
        // Better: whitelist public routes.
        const isPublic =
            request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.startsWith('/static') ||
            request.nextUrl.pathname.startsWith('/favicon.ico') ||
            request.nextUrl.pathname.includes('.'); // file extensions

        if (!isPublic) {
            const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
            return setSecurityHeaders(loginRedirect);
        }
    }

    // Redirect logged in users away from auth pages
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        return setSecurityHeaders(redirectResponse);
    }

    // Apply security headers to all responses
    return setSecurityHeaders(response);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
