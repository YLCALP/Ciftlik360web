import {
    LayoutDashboard,
    Beef,
    Warehouse,
    BadgeTurkishLira,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
    {
        label: 'Operasyon',
        items: [
            { title: 'Ana Sayfa', href: '/', icon: LayoutDashboard },
            { title: 'Hayvanlar', href: '/animals', icon: Beef },
            { title: 'Envanter', href: '/inventory', icon: Warehouse },
        ],
    },
    {
        label: 'Finans',
        items: [
            { title: 'Finans', href: '/finance', icon: BadgeTurkishLira },
        ],
    },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

/**
 * Segment-based match: "/" only matches the exact root, every other route
 * matches itself and its sub-routes (so /animals/[id] keeps "Hayvanlar" active).
 */
export function isNavItemActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
}

/** Turkish label for a route's first segment — used for the header breadcrumb. */
export const pageTitles: Record<string, string> = {
    dashboard: 'Genel Bakış',
    animals: 'Hayvanlar',
    inventory: 'Envanter',
    finance: 'Finans',
    settings: 'Ayarlar',
};
