import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelProps {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

/** A bordered, labelled region for grouping a chart, list, or table. */
export function Panel({ title, description, actions, children, className, contentClassName }: PanelProps) {
    return (
        <div className={cn('rounded-lg border bg-card', className)}>
            {(title || actions) && (
                <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
                    <div>
                        {title && <h2 className="text-sm font-semibold">{title}</h2>}
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={cn('p-5', contentClassName)}>{children}</div>
        </div>
    );
}
