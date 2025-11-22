'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OverviewChartProps {
    data: {
        date: string;
        income: number;
        expense: number;
    }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Gelir ve Gider Özeti</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => format(new Date(value), 'MMM', { locale: tr })}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₺${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Gelir
                                                        </span>
                                                        <span className="font-bold text-primary">
                                                            {formatCurrency(payload[0].value as number)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Gider
                                                        </span>
                                                        <span className="font-bold text-destructive">
                                                            {formatCurrency(payload[1].value as number)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    {label && format(new Date(label), 'd MMMM yyyy', { locale: tr })}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="var(--color-primary)"
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="var(--color-destructive)"
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
