'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/shared/Sidebar'; // Reuse Sidebar content or create a specific one
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sheet when route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
