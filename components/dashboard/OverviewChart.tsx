'use client';

import { AreaChart } from '@/components/charts/area-chart';
import { Area } from '@/components/charts/area';
import { Grid } from '@/components/charts/grid';
import { XAxis } from '@/components/charts/x-axis';
import { ChartTooltip } from '@/components/charts/tooltip/chart-tooltip';
import { TooltipContent } from '@/components/charts/tooltip/tooltip-content';
import { Panel } from '@/components/shared/Panel';
import { formatCurrency, formatDate } from '@/lib/format';

interface OverviewChartProps {
    data: {
        date: string;
        gelir: number;
        gider: number;
    }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <Panel title="Gelir ve Gider Özeti">
            <AreaChart data={data} xDataKey="date" aspectRatio="auto" style={{ height: 350 }}>
                <Grid horizontal />
                <XAxis tickMode="data" />
                <Area dataKey="gelir" fill="var(--chart-1)" />
                <Area dataKey="gider" fill="var(--chart-5)" />
                <ChartTooltip
                    content={({ point }) => (
                        <TooltipContent
                            title={formatDate(point.date as string, 'long')}
                            rows={[
                                { color: 'var(--chart-1)', label: 'Gelir', value: formatCurrency(point.gelir as number) },
                                { color: 'var(--chart-5)', label: 'Gider', value: formatCurrency(point.gider as number) },
                            ]}
                        />
                    )}
                />
            </AreaChart>
        </Panel>
    );
}
