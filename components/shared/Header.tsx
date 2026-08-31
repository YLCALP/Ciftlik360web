'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { pageTitles } from '@/components/shared/nav-config';

function getPageTitle(pathname: string): string {
    const segments = pathname.split('/').filter(Boolean);
    const currentPage = segments[0] || 'dashboard';
    return pageTitles[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
}

export function Header() {
    const pathname = usePathname();

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{getPageTitle(pathname)}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}
