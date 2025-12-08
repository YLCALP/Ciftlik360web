import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_SECRET_NAME = 'csrf-secret';

/**
 * Generate a new CSRF token
 * @returns The CSRF token to be included in forms
 */
export async function generateCsrfToken(): Promise<string> {
    const cookieStore = await cookies();

    // Generate a random secret if it doesn't exist
    let secret = cookieStore.get(CSRF_SECRET_NAME)?.value;

    if (!secret) {
        secret = randomBytes(32).toString('hex');
        cookieStore.set(CSRF_SECRET_NAME, secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });
    }

    // Generate token based on secret and timestamp
    const timestamp = Date.now().toString();
    const token = createHash('sha256')
        .update(`${secret}-${timestamp}`)
        .digest('hex');

    // Store token in cookie
    cookieStore.set(CSRF_TOKEN_NAME, token, {
        httpOnly: false, // Needs to be readable by client-side JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    return token;
}

/**
 * Validate a CSRF token
 * @param token The token to validate
 * @returns True if valid, false otherwise
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
    if (!token) {
        return false;
    }

    const cookieStore = await cookies();
    const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;

    if (!storedToken) {
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(token, storedToken);
}

/**
 * Clear CSRF tokens
 */
export async function clearCsrfTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(CSRF_TOKEN_NAME);
    cookieStore.delete(CSRF_SECRET_NAME);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}
