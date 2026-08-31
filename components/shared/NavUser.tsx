'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    ChevronsUpDown,
    LogOut,
    Monitor,
    Moon,
    Settings,
    Sun,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function NavUser() {
    const router = useRouter();
    const { isMobile } = useSidebar();
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchUser() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const { data: profile } = await supabase
                .from('users')
                .select('name')
                .eq('id', authUser.id)
                .single();

            setUser({
                name: profile?.name || authUser.email || 'Kullanıcı',
                email: authUser.email || '',
            });
        }
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                router.push('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const displayName = user?.name || 'Kullanıcı';
    const displayEmail = user?.email || '';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="size-8 rounded-md">
                                <AvatarFallback className="rounded-md">{getInitials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{displayName}</span>
                                <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="size-8 rounded-md">
                                    <AvatarFallback className="rounded-md">{getInitials(displayName)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex w-full cursor-pointer items-center">
                                <Settings />
                                <span>Ayarlar</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                {theme === 'dark' ? <Moon /> : theme === 'light' ? <Sun /> : <Monitor />}
                                <span>Tema</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
                                    <DropdownMenuRadioItem value="light">
                                        <Sun /> Açık
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="dark">
                                        <Moon /> Koyu
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="system">
                                        <Monitor /> Sistem
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOut />
                            <span>Çıkış Yap</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
