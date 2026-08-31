'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Animal, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Wallet } from 'lucide-react';
import { TransactionList } from '@/components/finance/TransactionList';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/lib/toast';
import { Panel } from '@/components/shared/Panel';
import { PageHeader } from '@/components/shared/PageHeader';
import { animalStatusBadge } from '@/lib/animal-status';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

import { AnimalDetailSkeleton } from '@/components/animals/AnimalDetailSkeleton';

export default function AnimalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const supabase = createClient();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    async function fetchData() {
        try {
            // Fetch animal details
            const { data: animalData, error: animalError } = await supabase
                .from('animals')
                .select('*')
                .eq('id', id)
                .single();

            if (animalError) throw animalError;
            setAnimal(animalData);

            // Fetch animal transactions
            const { data: transactionData, error: transactionError } = await supabase
                .from('transactions')
                .select('*')
                .eq('animal_id', id)
                .order('date', { ascending: false });

            if (transactionError) throw transactionError;
            setTransactions(transactionData || []);

        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error('Hata!', 'Veriler yüklenirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    }

    const handleAddExpense = async (data: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('User not authenticated');
                return;
            }

            const newTransaction = {
                ...data,
                user_id: user.id,
                animal_id: id, // Link to this animal
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
            toast.success('Masraf eklendi!', 'Masraf başarıyla bu hayvana işlendi.');
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Hata!', 'Masraf eklenirken bir sorun oluştu.');
        }
    };

    if (loading) {
        return <AnimalDetailSkeleton />;
    }

    if (!animal) {
        return <div className="p-8 text-center">Hayvan bulunamadı.</div>;
    }

    const status = animalStatusBadge(animal.status);
    const infoRows: { label: string; value: string; mono?: boolean }[] = [
        { label: 'Küpe No', value: animal.tag_number, mono: true },
        { label: 'Tür', value: animal.species },
        { label: 'Irk', value: animal.breed || '-' },
        { label: 'Cinsiyet', value: animal.gender === 'Erkek' ? 'Erkek' : 'Dişi' },
        { label: 'Doğum Tarihi', value: animal.birth_date ? formatDate(animal.birth_date) : '-', mono: true },
        { label: 'Alış Fiyatı', value: formatCurrency(animal.purchase_price), mono: true },
    ];

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Hayvanlar
            </Button>

            <PageHeader
                title={animal.name || animal.tag_number}
                description={[animal.species, animal.breed].filter(Boolean).join(' · ')}
                actions={<Badge className={cn('border-transparent', status.badgeClass)}>{status.label}</Badge>}
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Panel title="Temel Bilgiler">
                    <dl className="-my-2.5 divide-y divide-border">
                        {infoRows.map((row) => (
                            <div key={row.label} className="flex items-center justify-between py-2.5">
                                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                                <dd className={cn('text-sm font-medium', row.mono && 'tnum')}>{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </Panel>

                <Panel
                    title="Masraflar"
                    actions={
                        <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Masraf Ekle
                        </Button>
                    }
                >
                    {transactions.length === 0 ? (
                        <EmptyState
                            icon={Wallet}
                            title="Masraf Yok"
                            description="Bu hayvan için henüz bir masraf girilmemiş."
                            actionLabel="Masraf Ekle"
                            onAction={() => setIsModalOpen(true)}
                        />
                    ) : (
                        <TransactionList transactions={transactions} />
                    )}
                </Panel>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAddExpense}
                forcedType="Gider"
            />
        </div>
    );
}
