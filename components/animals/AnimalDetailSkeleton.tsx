import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnimalDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" /> {/* Back button */}
                <Skeleton className="h-9 w-48" /> {/* Title */}
                <Skeleton className="h-6 w-20 rounded-full" /> {/* Badge */}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-20 mb-2" /> {/* Label */}
                                    <Skeleton className="h-5 w-32" /> {/* Value */}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle><Skeleton className="h-6 w-24" /></CardTitle>
                        <Skeleton className="h-9 w-32" /> {/* Add Button */}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="flex justify-between mb-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            {/* Rows */}
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
