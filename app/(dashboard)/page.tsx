'use client';

import { useState, useEffect } from 'react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beef, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardStats, Transaction } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { OverviewChart } from '@/components/dashboard/OverviewChart';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalAnimals: 0,
        sickAnimals: 0,
        lowStockItems: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
    });
    const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<{ date: string; income: number; expense: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch Animals Count
                const { count: animalsCount, error: animalsError } = await supabase
                    .from('animals')
                    .select('*', { count: 'exact', head: true });

                if (animalsError) throw animalsError;

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

                let income = 0;
                let expense = 0;

                monthlyTransactions?.forEach(t => {
                    if (t.type === 'income') income += t.amount;
                    else if (t.type === 'expense') expense += t.amount;
                });

                // Fetch Chart Data (Last 6 months)
                const sixMonthsAgo = subMonths(now, 5);
                const { data: chartTransactions, error: chartError } = await supabase
                    .from('transactions')
                    .select('amount, type, date')
                    .gte('date', startOfMonth(sixMonthsAgo).toISOString());

                if (chartError) throw chartError;

                // Process chart data
                const processedChartData = new Map<string, { date: string; income: number; expense: number }>();

                // Initialize last 6 months
                for (let i = 0; i < 6; i++) {
                    const date = subMonths(now, i);
                    const key = format(date, 'yyyy-MM');
                    processedChartData.set(key, {
                        date: date.toISOString(),
                        income: 0,
                        expense: 0
                    });
                }

                chartTransactions?.forEach(t => {
                    const date = new Date(t.date);
                    const key = format(date, 'yyyy-MM');
                    if (processedChartData.has(key)) {
                        const entry = processedChartData.get(key)!;
                        if (t.type === 'income') entry.income += t.amount;
                        else entry.expense += t.amount;
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

                setStats({
                    totalAnimals: animalsCount || 0,
                    sickAnimals: 0,
                    lowStockItems: lowStockCount || 0,
                    monthlyIncome: income,
                    monthlyExpense: expense,
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>
                <div className="text-sm text-muted-foreground">
                    Son güncelleme: {format(new Date(), 'HH:mm')}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="animate-slide-up delay-0 hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Hayvan</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Beef className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAnimals}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Aktif çiftlik mevcudu
                        </p>
                    </CardContent>
                </Card>

                <Card className="animate-slide-up delay-100 hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-destructive">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kritik Stok</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            10 birim altı ürünler
                        </p>
                    </CardContent>
                </Card>

                <Card className="animate-slide-up delay-200 hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyIncome)}</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            Bu ay
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-slide-up delay-300 hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aylık Gider</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.monthlyExpense)}</div>
                        <div className="flex items-center text-xs text-red-600 mt-1">
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                            Bu ay
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 animate-slide-up delay-200">
                    <OverviewChart data={chartData} />
                </div>

                <Card className="col-span-3 animate-slide-up delay-300">
                    <CardHeader>
                        <CardTitle>Son Aktiviteler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Henüz aktivite yok.</p>
                            ) : (
                                recentActivity.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center group">
                                        <div className={`
                                            flex h-9 w-9 items-center justify-center rounded-full border transition-colors
                                            ${transaction.type === 'income'
                                                ? 'bg-green-500/10 border-green-500/20 group-hover:bg-green-500/20'
                                                : 'bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20'}
                                        `}>
                                            {transaction.type === 'income'
                                                ? <ArrowUpRight className="h-4 w-4 text-green-500" />
                                                : <ArrowDownRight className="h-4 w-4 text-red-500" />
                                            }
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                {transaction.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.date), 'd MMMM yyyy', { locale: tr })}
                                            </p>
                                        </div>
                                        <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
