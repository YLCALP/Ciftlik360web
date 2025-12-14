'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionList } from '@/components/finance/TransactionList';
import { FinanceSummary } from '@/components/finance/FinanceSummary';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Download } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { toast } from '@/lib/toast';

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { FinanceSkeleton } from '@/components/finance/FinanceSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Wallet } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from '@/lib/export';

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        start: '',
        end: ''
    });
    const [typeFilter, setTypeFilter] = useState<string>('Hepsi');

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

    const filteredTransactions = transactions.filter(t => {
        if (dateFilter.start && t.date < dateFilter.start) return false;
        if (dateFilter.end && t.date > dateFilter.end) return false;

        if (typeFilter !== 'Hepsi' && t.type !== typeFilter) return false;

        return true;
    });

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
            toast.success(
                'İşlem eklendi!',
                `${data.type === 'income' ? 'Gelir' : 'Gider'} kaydı başarıyla oluşturuldu.`
            );
        } catch (error) {
            console.error('Error creating transaction:', error);
            toast.error('Hata!', 'İşlem eklenirken bir sorun oluştu.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex gap-4 items-end bg-card p-4 rounded-lg border shadow-sm animate-slide-up delay-100">
                <div className="grid gap-1.5">
                    <Label htmlFor="start-date">Başlangıç Tarihi</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[200px] pl-3 text-left font-normal",
                                    !dateFilter.start && "text-muted-foreground"
                                )}
                            >
                                {dateFilter.start ? (
                                    format(new Date(dateFilter.start), "PPP", { locale: tr })
                                ) : (
                                    <span>Tarih seçin</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFilter.start ? new Date(dateFilter.start) : undefined}
                                onSelect={(date) => setDateFilter(prev => ({ ...prev, start: date ? format(date, 'yyyy-MM-dd') : '' }))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="end-date">Bitiş Tarihi</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[200px] pl-3 text-left font-normal",
                                    !dateFilter.end && "text-muted-foreground"
                                )}
                            >
                                {dateFilter.end ? (
                                    format(new Date(dateFilter.end), "PPP", { locale: tr })
                                ) : (
                                    <span>Tarih seçin</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFilter.end ? new Date(dateFilter.end) : undefined}
                                onSelect={(date) => setDateFilter(prev => ({ ...prev, end: date ? format(date, 'yyyy-MM-dd') : '' }))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-1.5">
                    <Label>Tür</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Türe göre filtrele" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hepsi">Tüm İşlemler</SelectItem>
                            <SelectItem value="income">Gelir</SelectItem>
                            <SelectItem value="expense">Gider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {(dateFilter.start || dateFilter.end || typeFilter !== 'Hepsi') && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setDateFilter({ start: '', end: '' });
                            setTypeFilter('Hepsi');
                        }}
                        className="mb-0.5"
                    >
                        Filtreyi Temizle
                    </Button>
                )}
                <div className="flex gap-2 ml-auto mb-0.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Dışa Aktar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                const success = exportToExcel(
                                    filteredTransactions.map((t: Transaction) => ({
                                        'Tarih': t.date,
                                        'Açıklama': t.description,
                                        'Kategori': t.category,
                                        'Tür': t.type === 'income' ? 'Gelir' : 'Gider',
                                        'Tutar': t.amount,
                                        'Notlar': t.notes || '-',
                                    })),
                                    'İşlemler'
                                );
                                if (success) toast.success('Başarılı!', 'Excel dosyası indirildi.');
                                else toast.error('Hata!', 'Dışa aktarma başarısız.');
                            }}>
                                Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                const success = exportToPDF(
                                    filteredTransactions,
                                    [
                                        { header: 'Tarih', dataKey: 'date' },
                                        { header: 'Açıklama', dataKey: 'description' },
                                        { header: 'Kategori', dataKey: 'category' },
                                        { header: 'Tür', dataKey: 'type' },
                                        { header: 'Tutar', dataKey: 'amount' },
                                    ],
                                    'İşlemler',
                                    'Finans İşlemler Listesi'
                                );
                                if (success) toast.success('Başarılı!', 'PDF dosyası indirildi.');
                                else toast.error('Hata!', 'Dışa aktarma başarısız.');
                            }}>
                                PDF (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> İşlem Ekle
                    </Button>
                </div>

            </div>

            {loading ? (
                <FinanceSkeleton />
            ) : filteredTransactions.length === 0 ? (
                <EmptyState
                    icon={Wallet}
                    title="İşlem bulunamadı"
                    description="Gelir ve giderlerinizi kaydederek finansal durumunuzu takip edin."
                    actionLabel="İşlem Ekle"
                    onAction={() => setIsModalOpen(true)}
                />
            ) : (
                <div className="space-y-6 animate-slide-up delay-200">
                    <FinanceSummary transactions={filteredTransactions} />
                    <TransactionList transactions={filteredTransactions} />
                </div>
            )}

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAddTransaction}
            />
        </div>
    );
}
