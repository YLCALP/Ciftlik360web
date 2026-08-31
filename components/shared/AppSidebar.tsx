'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/shared/NavUser';
import { navGroups, isNavItemActive } from '@/components/shared/nav-config';

export function AppSidebar() {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    // shadcn's sidebar doesn't close the mobile sheet on navigation by default.
    useEffect(() => {
        setOpenMobile(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-semibold text-primary-foreground">
                                    Ç
                                </span>
                                <span className="text-figure text-base">Çiftlik360</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const active = isNavItemActive(pathname, item.href);
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                                                <Link href={item.href}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
