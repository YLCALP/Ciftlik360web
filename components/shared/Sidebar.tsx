'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Beef,
    Warehouse,
    BadgeTurkishLira,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
    {
        title: 'Ana Sayfa',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        title: 'Hayvanlar',
        href: '/animals',
        icon: Beef,
    },
    {
        title: 'Envanter',
        href: '/inventory',
        icon: Warehouse,
    },
    {
        title: 'Finans',
        href: '/finance',
        icon: BadgeTurkishLira,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={cn(
                "relative flex h-full flex-col border-r bg-card text-card-foreground transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 border-b">
                {!isCollapsed && <h1 className="text-2xl font-bold text-primary truncate">Çiftlik360</h1>}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto", isCollapsed && "mx-auto")}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center rounded-md py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                isCollapsed ? 'justify-center px-2' : 'px-4',
                                pathname === item.href
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground'
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
