import { NextResponse } from 'next/server';

/**
 * Security headers to protect against common web vulnerabilities
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy - Prevents XSS attacks
    // Note: Adjust this based on your actual needs (e.g., if using external scripts/styles)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https:;
        connect-src 'self' https://*.supabase.co;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);

    // Prevent clickjacking attacks
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Restrict browser features and APIs
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Enable XSS protection (legacy but still useful)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // HSTS - Force HTTPS (only in production)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    // Remove X-Powered-By header to hide technology stack
    response.headers.delete('X-Powered-By');

    return response;
}
