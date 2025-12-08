'use client';

import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/shared/MobileNav';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { ModeToggle } from '@/components/mode-toggle';

// Sayfa isimlerini Türkçe'ye çevir
const getPageTitle = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    const currentPage = segments[0] || 'dashboard';

    const pageTitles: Record<string, string> = {
        'dashboard': 'Genel Bakış',
        'animals': 'Hayvanlar',
        'inventory': 'Envanter',
        'finance': 'Finans',
        'reports': 'Raporlar',
        'settings': 'Ayarlar',
    };

    return pageTitles[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
};

export function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                router.push('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
                <MobileNav />
                <h1 className="text-xl font-semibold">{getPageTitle(pathname)}</h1>
            </div>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer w-full flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Ayarlar</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Çıkış Yap</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
