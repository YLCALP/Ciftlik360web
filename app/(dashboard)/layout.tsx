import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { Header } from '@/components/shared/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="mx-auto w-full max-w-[1400px]">{children}</div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
