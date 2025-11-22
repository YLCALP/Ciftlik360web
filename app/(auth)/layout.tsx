export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary tracking-tight">Çiftlik360</h1>
                <p className="mt-2 text-lg text-muted-foreground">Modern Farm Management System</p>
            </div>
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Çiftlik360. All rights reserved.
            </div>
        </div>
    );
}
