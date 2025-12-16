'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Animal, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Wallet } from 'lucide-react';
import { TransactionList } from '@/components/finance/TransactionList';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Badge variant={animal.status === 'Active' ? 'default' : 'secondary'}>
                    {animal.status}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Temel Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Küpe No</p>
                                <p className="font-medium">{animal.tag_number}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Tür</p>
                                <p className="font-medium">{animal.species}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Irk</p>
                                <p className="font-medium">{animal.breed || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Cinsiyet</p>
                                <p className="font-medium">{animal.gender === 'Erkek' ? 'Erkek' : 'Dişi'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Doğum Tarihi</p>
                                <p className="font-medium">
                                    {animal.birth_date ? format(new Date(animal.birth_date), 'dd.MM.yyyy', { locale: tr }) : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Alış Fiyatı</p>
                                <p className="font-medium">{animal.purchase_price.toLocaleString('tr-TR')}₺</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Masraflar</CardTitle>
                        <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Masraf Ekle
                        </Button>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
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
