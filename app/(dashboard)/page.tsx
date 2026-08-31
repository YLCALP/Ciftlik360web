'use client';

import { useState, useEffect } from 'react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { createClient } from '@/lib/supabase/client';
import { Beef, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { DashboardStats, Transaction } from '@/lib/types';
import { format, subMonths, startOfMonth } from 'date-fns';
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { HerdStrip } from '@/components/dashboard/HerdStrip';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel } from '@/components/shared/Panel';
import { StatBand } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/format';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalAnimals: 0,
        sickAnimals: 0,
        lowStockItems: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
    });
    const [animalStatuses, setAnimalStatuses] = useState<{ status: string | null }[]>([]);
    const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<{ date: string; gelir: number; gider: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch all animal statuses — drives the herd strip plus the
                // active/sick counts below.
                const { data: animals, error: animalsError } = await supabase
                    .from('animals')
                    .select('status');

                if (animalsError) throw animalsError;

                const totalAnimals = (animals ?? []).filter((a) => (a.status ?? 'Aktif') === 'Aktif').length;
                const sickAnimals = (animals ?? []).filter((a) => a.status === 'Hasta').length;

                // Fetch Low Stock Items (quantity < 10)
                const { count: lowStockCount, error: lowStockError } = await supabase
                    .from('inventory')
                    .select('*', { count: 'exact', head: true })
                    .lt('quantity', 10);

                if (lowStockError) throw lowStockError;

                // Fetch Monthly Transactions for Stats
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

                const { data: monthlyTransactions, error: transactionsError } = await supabase
                    .from('transactions')
                    .select('amount, type')
                    .gte('date', firstDayOfMonth);

                if (transactionsError) throw transactionsError;

                let gelir = 0;
                let gider = 0;

                monthlyTransactions?.forEach(t => {
                    if (t.type === 'Gelir') gelir += t.amount;
                    else if (t.type === 'Gider') gider += t.amount;
                });

                // Fetch Chart Data (Last 6 months)
                const sixMonthsAgo = subMonths(now, 5);
                const { data: chartTransactions, error: chartError } = await supabase
                    .from('transactions')
                    .select('amount, type, date')
                    .gte('date', startOfMonth(sixMonthsAgo).toISOString());

                if (chartError) throw chartError;

                // Process chart data
                const processedChartData = new Map<string, { date: string; gelir: number; gider: number }>();

                // Initialize last 6 months
                for (let i = 0; i < 6; i++) {
                    const date = subMonths(now, i);
                    const key = format(date, 'yyyy-MM');
                    processedChartData.set(key, {
                        date: date.toISOString(),
                        gelir: 0,
                        gider: 0
                    });
                }

                chartTransactions?.forEach(t => {
                    const date = new Date(t.date);
                    const key = format(date, 'yyyy-MM');
                    if (processedChartData.has(key)) {
                        const entry = processedChartData.get(key)!;
                        if (t.type === 'Gelir') entry.gelir += t.amount;
                        else entry.gider += t.amount;
                    }
                });

                const sortedChartData = Array.from(processedChartData.values())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setChartData(sortedChartData);

                // Fetch Recent Activity
                const { data: recentData, error: recentError } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (recentError) throw recentError;

                setAnimalStatuses(animals ?? []);
                setStats({
                    totalAnimals,
                    sickAnimals,
                    lowStockItems: lowStockCount || 0,
                    monthlyIncome: gelir,
                    monthlyExpense: gider,
                });
                setRecentActivity(recentData || []);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Genel Bakış" description="Çiftliğinizin güncel durumu" />

            <StatBand
                items={[
                    { label: 'Toplam Hayvan', value: stats.totalAnimals, icon: Beef, hint: 'Aktif çiftlik mevcudu' },
                    {
                        label: 'Hasta Hayvan',
                        value: stats.sickAnimals,
                        icon: AlertTriangle,
                        tone: stats.sickAnimals > 0 ? 'warning' : 'default',
                        hint: 'Tedavi altındaki hayvanlar',
                    },
                    {
                        label: 'Kritik Stok',
                        value: stats.lowStockItems,
                        icon: AlertTriangle,
                        tone: stats.lowStockItems > 0 ? 'negative' : 'default',
                        hint: '10 birim altı ürünler',
                    },
                    {
                        label: 'Aylık Gelir',
                        value: formatCurrency(stats.monthlyIncome),
                        icon: TrendingUp,
                        tone: 'positive',
                        hint: 'Bu ay',
                    },
                    {
                        label: 'Aylık Gider',
                        value: formatCurrency(stats.monthlyExpense),
                        icon: TrendingDown,
                        tone: 'negative',
                        hint: 'Bu ay',
                    },
                ]}
            />

            <HerdStrip animals={animalStatuses} />

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <OverviewChart data={chartData} />
                </div>

                <Panel title="Son Aktiviteler" contentClassName="p-0">
                    {recentActivity.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Henüz aktivite yok.</p>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentActivity.map((transaction) => (
                                <div key={transaction.id} className="flex items-center gap-3 px-5 py-3">
                                    <span
                                        className={`text-figure text-base ${transaction.type === 'Gelir' ? 'text-chart-1' : 'text-chart-5'}`}
                                        aria-hidden
                                    >
                                        {transaction.type === 'Gelir' ? '+' : '−'}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{transaction.description}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(transaction.date, 'long')}</p>
                                    </div>
                                    <div
                                        className={`text-figure shrink-0 text-sm ${transaction.type === 'Gelir' ? 'text-chart-1' : 'text-chart-5'}`}
                                    >
                                        {transaction.type === 'Gelir' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}
