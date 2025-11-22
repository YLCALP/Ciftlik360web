import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function FinanceSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[100px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
            <div>
                <Skeleton className="h-6 w-[150px] mb-4" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[100px]" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-[80px]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
