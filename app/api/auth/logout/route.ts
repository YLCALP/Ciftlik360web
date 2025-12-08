import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { clearSession } from '@/lib/session';
import { clearCsrfTokens } from '@/lib/csrf';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            return NextResponse.json(
                { error: 'Logout failed' },
                { status: 500 }
            );
        }

        // Clear session data
        await clearSession();

        // Clear CSRF tokens
        await clearCsrfTokens();

        // Create response with cleared cookies
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Clear all auth-related cookies
        response.cookies.delete('last-activity');
        response.cookies.delete('csrf-token');
        response.cookies.delete('csrf-secret');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
