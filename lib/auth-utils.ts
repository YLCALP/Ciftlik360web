import { createClient } from '@/lib/supabase/client';

/**
 * Clear all authentication cookies and local storage
 * This is useful when dealing with invalid refresh tokens
 */
export async function clearAuthSession() {
    const supabase = createClient();

    try {
        // Sign out from Supabase (this will clear cookies)
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Error during sign out:', error);
    }

    // Clear any remaining auth-related items from localStorage
    if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

/**
 * Handle auth errors and redirect to login if needed
 */
export function handleAuthError(error: any) {
    if (error?.code === 'refresh_token_not_found' ||
        error?.message?.includes('refresh token') ||
        error?.status === 400) {
        // Clear session and redirect to login
        clearAuthSession().then(() => {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        });
        return true;
    }
    return false;
}
