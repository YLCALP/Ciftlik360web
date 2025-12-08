import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const LAST_ACTIVITY_COOKIE = 'last-activity';

/**
 * Check if the session has expired based on last activity
 * @returns True if session is valid, false if expired
 */
export async function checkSessionExpiry(): Promise<boolean> {
    const cookieStore = await cookies();
    const lastActivity = cookieStore.get(LAST_ACTIVITY_COOKIE)?.value;

    if (!lastActivity) {
        // No last activity recorded, update it
        await updateLastActivity();
        return true;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();

    if (now - lastActivityTime > SESSION_TIMEOUT) {
        // Session expired
        return false;
    }

    // Update last activity
    await updateLastActivity();
    return true;
}

/**
 * Update the last activity timestamp
 */
export async function updateLastActivity(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(LAST_ACTIVITY_COOKIE, Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_TIMEOUT / 1000, // Convert to seconds
        path: '/',
    });
}

/**
 * Refresh the Supabase session
 */
export async function refreshSession(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.refreshSession();

        if (error || !data.session) {
            return false;
        }

        await updateLastActivity();
        return true;
    } catch (error) {
        console.error('Error refreshing session:', error);
        return false;
    }
}

/**
 * Clear all session data
 */
export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    const supabase = await createClient();

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear activity tracking
    cookieStore.delete(LAST_ACTIVITY_COOKIE);
}

/**
 * Get session timeout duration in milliseconds
 */
export function getSessionTimeout(): number {
    return SESSION_TIMEOUT;
}
