export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
                    Ç
                </span>
                <span className="text-figure text-2xl">Çiftlik360</span>
            </div>
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Çiftlik360. Tüm hakları saklıdır.
            </div>
        </div>
    );
}
