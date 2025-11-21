'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
    const [status, setStatus] = useState<string>('Testing connection...');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function checkConnection() {
            try {
                // Try to fetch a single row from a likely table, or just check session
                // Since we don't know the schema for sure, we'll try a simple health check
                // by querying a non-existent table which should return a specific error,
                // or better, just try to get the session.

                // Actually, let's try to select from 'animals' as it's a farm app.
                const { data, error } = await supabase.from('animals').select('*').limit(1);

                if (error) {
                    setStatus(`Error: ${error.message}`);
                } else {
                    setStatus('Connection successful!');
                    setData(data);
                }
            } catch (err: any) {
                setStatus(`Exception: ${err.message}`);
            }
        }

        checkConnection();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            <p className="mb-4">Status: <span className="font-mono font-bold">{status}</span></p>
            {data && (
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}
