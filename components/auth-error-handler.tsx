'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { handleAuthError } from '@/lib/auth-utils';

/**
 * Global auth error handler component
 * This component listens for auth state changes and handles errors
 */
export function AuthErrorHandler() {
    useEffect(() => {
        const supabase = createClient();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            // Handle sign out events
            if (event === 'SIGNED_OUT') {
                // Clear any remaining session data
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }

            // Handle token refresh errors
            if (event === 'TOKEN_REFRESHED' && !session) {
                console.error('Token refresh failed');
                handleAuthError({ code: 'refresh_token_not_found' });
            }
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return null;
}
