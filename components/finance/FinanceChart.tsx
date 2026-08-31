'use client';

import { BarChart } from '@/components/charts/bar-chart';
import { Bar } from '@/components/charts/bar';
import { Grid } from '@/components/charts/grid';
import { BarXAxis } from '@/components/charts/bar-x-axis';
import { ChartTooltip } from '@/components/charts/tooltip/chart-tooltip';
import { TooltipContent } from '@/components/charts/tooltip/tooltip-content';
import { Panel } from '@/components/shared/Panel';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { groupTransactionsByMonth } from '@/lib/transactions';

interface FinanceChartProps {
    transactions: Transaction[];
}

export function FinanceChart({ transactions }: FinanceChartProps) {
    const monthlyData = groupTransactionsByMonth(transactions);

    return (
        <Panel title="Aylık Gelir ve Gider">
            <BarChart data={monthlyData} xDataKey="name" aspectRatio="auto" className="h-[350px]">
                <Grid horizontal />
                <BarXAxis />
                <Bar dataKey="Gelir" fill="var(--chart-1)" />
                <Bar dataKey="Gider" fill="var(--chart-5)" />
                <ChartTooltip
                    content={({ point }) => (
                        <TooltipContent
                            title={point.name as string}
                            rows={[
                                { color: 'var(--chart-1)', label: 'Gelir', value: formatCurrency(point.Gelir as number) },
                                { color: 'var(--chart-5)', label: 'Gider', value: formatCurrency(point.Gider as number) },
                            ]}
                        />
                    )}
                />
            </BarChart>
        </Panel>
    );
}
