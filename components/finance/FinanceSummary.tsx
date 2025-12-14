'use client';

import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, BadgeTurkishLira } from 'lucide-react';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface FinanceSummaryProps {
    transactions: Transaction[];
}

export function FinanceSummary({ transactions }: FinanceSummaryProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDark = theme === 'dark';

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Group transactions by month for chart
    const monthlyData = transactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthYear = format(date, 'MMM yyyy', { locale: tr });

        const existing = acc.find((item) => item.name === monthYear);
        if (existing) {
            if (t.type === 'income') {
                existing.income += t.amount;
            } else {
                existing.expense += t.amount;
            }
        } else {
            acc.push({
                name: monthYear,
                rawDate: date,
                income: t.type === 'income' ? t.amount : 0,
                expense: t.type === 'expense' ? t.amount : 0,
            });
        }
        return acc;
    }, [] as { name: string; rawDate: Date; income: number; expense: number }[])
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <ArrowUp className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalIncome.toLocaleString('tr-TR')}₺
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <ArrowDown className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {totalExpense.toLocaleString('tr-TR')}₺
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <BadgeTurkishLira className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netBalance.toLocaleString('tr-TR')}₺
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aylık Gelir ve Gider</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#E5E7EB'} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value.toLocaleString('tr-TR')}₺`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1f2937' : '#fff',
                                            borderColor: isDark ? '#374151' : '#e5e7eb',
                                            borderRadius: '8px',
                                            color: isDark ? '#fff' : '#000',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        itemStyle={{ color: isDark ? '#fff' : '#000' }}
                                        labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                                        formatter={(value: number) => `${value.toLocaleString('tr-TR')}₺`}
                                    />
                                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Gelir" barSize={40} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Gider" barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
