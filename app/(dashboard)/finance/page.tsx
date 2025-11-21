'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionList } from '@/components/finance/TransactionList';
import { FinanceSummary } from '@/components/finance/FinanceSummary';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Transaction } from '@/lib/types';

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('User not authenticated');
                return;
            }

            const newTransaction = {
                ...data,
                user_id: user.id,
                is_automatic: false,
            };

            const { data: insertedData, error } = await supabase
                .from('transactions')
                .insert([newTransaction])
                .select()
                .single();

            if (error) throw error;

            setTransactions([insertedData, ...transactions]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <FinanceSummary transactions={transactions} />

                    <div>
                        <h3 className="mb-4 text-xl font-semibold">Recent Transactions</h3>
                        <TransactionList transactions={transactions} />
                    </div>
                </>
            )}

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAddTransaction}
            />
        </div>
    );
}
