import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children?: ReactNode;
}

/** Title + primary actions row that opens every dashboard page. */
export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-figure">{title}</h1>
                    {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
