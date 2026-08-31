import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTone = 'default' | 'positive' | 'negative' | 'warning';

const toneClass: Record<StatTone, string> = {
    default: 'text-foreground',
    positive: 'text-chart-1',
    negative: 'text-chart-5',
    warning: 'text-chart-2',
};

export interface StatItem {
    label: string;
    value: string | number;
    unit?: string;
    hint?: string;
    icon?: LucideIcon;
    tone?: StatTone;
}

interface StatBandProps {
    items: StatItem[];
    className?: string;
}

// Tailwind needs literal class names to see them at build time — a lookup
// table keeps the responsive column counts static instead of interpolated.
const colsForCount: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-5',
};

/**
 * A single bordered strip of KPI figures divided by hairlines — replaces
 * the previous pattern of N separate shadowed cards with colored left rails.
 */
export function StatBand({ items, className }: StatBandProps) {
    return (
        <div
            className={cn(
                'grid divide-y divide-border rounded-lg border sm:divide-x sm:divide-y-0',
                colsForCount[items.length] ?? 'sm:grid-cols-2',
                className
            )}
        >
            {items.map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5 px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {item.icon && <item.icon className="size-3.5" />}
                        <span>{item.label}</span>
                    </div>
                    <div className={cn('text-figure text-2xl', toneClass[item.tone ?? 'default'])}>
                        {item.value}
                        {item.unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{item.unit}</span>}
                    </div>
                    {item.hint && <div className="text-xs text-muted-foreground">{item.hint}</div>}
                </div>
            ))}
        </div>
    );
}
