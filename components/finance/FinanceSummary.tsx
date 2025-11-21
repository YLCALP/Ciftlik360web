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
} from 'recharts';

interface FinanceSummaryProps {
    transactions: Transaction[];
}

export function FinanceSummary({ transactions }: FinanceSummaryProps) {
    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Group transactions by category for chart
    const categoryData = transactions.reduce((acc, t) => {
        const existing = acc.find((item) => item.name === t.category);
        if (existing) {
            if (t.type === 'income') {
                existing.income += t.amount;
            } else {
                existing.expense += t.amount;
            }
        } else {
            acc.push({
                name: t.category,
                income: t.type === 'income' ? t.amount : 0,
                expense: t.type === 'expense' ? t.amount : 0,
            });
        }
        return acc;
    }, [] as { name: string; income: number; expense: number }[]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₺{totalIncome.toLocaleString('tr-TR')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <ArrowDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₺{totalExpense.toLocaleString('tr-TR')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                        <BadgeTurkishLira className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₺{netBalance.toLocaleString('tr-TR')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Income vs Expense by Category</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₺${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
