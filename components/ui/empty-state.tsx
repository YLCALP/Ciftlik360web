import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} size="lg" className="min-w-[150px]">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
